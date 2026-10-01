import { loadConfig, WorkerConfig } from './config.js';
import { createDatabaseService, DatabaseService } from './db.js';
import { WorkerHeartbeatManager, TaskLeaseKeeper } from './lease.js';
import { TaskLogger } from './logger.js';
import { defaultHandlerRegistry } from './handlers/index.js';
import { Task, Run, TaskExecutionContext, TaskHandlerResult } from './types.js';

export class WorkerDaemon {
  private config: WorkerConfig;
  private db: DatabaseService;
  private heartbeatManager: WorkerHeartbeatManager;
  private isRunning = false;
  private isShuttingDown = false;
  private activeTaskPromise: Promise<void> | null = null;
  private currentLeaseKeeper: TaskLeaseKeeper | null = null;

  constructor(customConfig?: Partial<WorkerConfig>, customDb?: DatabaseService) {
    this.config = { ...loadConfig(), ...customConfig };
    this.db = customDb || createDatabaseService(this.config);
    this.heartbeatManager = new WorkerHeartbeatManager(this.db, this.config);
  }

  public async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isShuttingDown = false;

    console.log('\n======================================================');
    console.log(`🤖 Agentic Company Worker Daemon Starting`);
    console.log(`🆔 Worker ID:    ${this.config.workerId}`);
    console.log(`🖥️  Host:         ${this.config.workerHost}`);
    console.log(`⚡ Mode:         ${this.db.isMock() ? 'Local Mock / In-Memory' : 'Supabase Live'}`);
    console.log(`🛠️  Capabilities: ${this.config.capabilities.join(', ')}`);
    console.log(`⏱️  Poll Interval: ${this.config.pollIntervalMs}ms | Lease: ${this.config.leaseDurationSeconds}s`);
    console.log('======================================================\n');

    // Start background heartbeats
    this.heartbeatManager.start();

    // Register signal handlers for clean process shutdown
    this.setupSignalHandlers();

    // Main polling loop
    await this.runLoop();
  }

  public async stop(): Promise<void> {
    if (!this.isRunning || this.isShuttingDown) return;
    this.isShuttingDown = true;
    console.log('\n[WorkerDaemon] Received stop signal. Draining active tasks...');

    if (this.currentLeaseKeeper) {
      await this.currentLeaseKeeper.releaseImmediate();
    }

    if (this.activeTaskPromise) {
      await this.activeTaskPromise;
    }

    await this.heartbeatManager.stop();
    this.isRunning = false;
    console.log('[WorkerDaemon] Worker daemon stopped cleanly.');
  }

  private setupSignalHandlers(): void {
    const handleExit = async (signal: string) => {
      console.log(`\n[WorkerDaemon] Received ${signal}. Initiating graceful shutdown...`);
      await this.stop();
      process.exit(0);
    };

    process.once('SIGINT', () => void handleExit('SIGINT'));
    process.once('SIGTERM', () => void handleExit('SIGTERM'));
  }

  private async runLoop(): Promise<void> {
    while (!this.isShuttingDown) {
      try {
        const task = await this.db.claimNextTask(this.config.workerId, this.config.leaseDurationSeconds);
        if (task) {
          this.activeTaskPromise = this.executeTask(task);
          await this.activeTaskPromise;
          this.activeTaskPromise = null;
        } else {
          // No task available; pause before next poll
          await new Promise(resolve => setTimeout(resolve, this.config.pollIntervalMs));
        }
      } catch (err) {
        console.error('[WorkerDaemon] Error in poll loop:', err);
        await new Promise(resolve => setTimeout(resolve, this.config.pollIntervalMs));
      }
    }
  }

  public async executeTask(task: Task): Promise<void> {
    console.log(`\n[WorkerDaemon] ⚡ Claimed Task: ${task.id} (Type: ${task.type}, Priority: ${task.priority}, Attempt: ${task.attempts}/${task.max_attempts})`);

    // 1. Create run record
    const run = await this.db.createRun(task.id, task.owner_agent);

    // 2. Initialize streaming logger & lease keeper
    const logger = new TaskLogger(run.id, this.db, this.config.logBatchIntervalMs);
    const leaseKeeper = new TaskLeaseKeeper(task.id, this.db, this.config.leaseDurationSeconds);
    this.currentLeaseKeeper = leaseKeeper;
    leaseKeeper.start();

    logger.log('info', `Task execution started on worker ${this.config.workerId}. Run ID: ${run.id}`);

    // 3. Find registered handler
    const handler = defaultHandlerRegistry.get(task.type);
    if (!handler) {
      logger.log('error', `No registered handler found for task type: "${task.type}". Available handlers: ${defaultHandlerRegistry.getSupportedTypes().join(', ')}`);
      await logger.close();
      leaseKeeper.stop();
      this.currentLeaseKeeper = null;

      await this.db.finishRun(run.id, {
        exitCode: 126,
        summary: `Unsupported task type: "${task.type}"`
      });
      await this.db.updateTaskStatus(task.id, 'failed');
      return;
    }

    // 4. Construct context and execute
    const ctx: TaskExecutionContext = {
      task,
      run,
      workerId: this.config.workerId,
      log: (level, msg) => logger.log(level, msg),
      isCancelled: () => this.isShuttingDown || leaseKeeper.isCancelled()
    };

    let handlerResult: TaskHandlerResult;
    try {
      handlerResult = await handler(ctx);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.log('error', `Handler threw uncaught exception: ${errorMsg}`);
      handlerResult = {
        exitCode: 1,
        summary: `Handler crashed: ${errorMsg}`,
        result: { error: errorMsg }
      };
    }

    // 5. Handle One-Way Door approval request
    if (handlerResult.requestApproval) {
      logger.log('warn', `Pausing task for Chairman 1-Way Door approval: ${handlerResult.requestApproval.action}`);
      await this.db.createApproval({
        task_id: task.id,
        requested_by: task.owner_agent || this.config.workerId,
        action: handlerResult.requestApproval.action,
        door: 'one_way',
        decision: 'pending',
        note: handlerResult.requestApproval.note || null
      });

      await this.db.updateTaskStatus(task.id, 'approval_pending');
      await this.db.finishRun(run.id, {
        exitCode: 0,
        summary: `Awaiting 1-Way Door Approval: ${handlerResult.requestApproval.action}`,
        result: handlerResult.result
      });

      leaseKeeper.stop();
      this.currentLeaseKeeper = null;
      await logger.close();
      return;
    }

    // 6. Handle Artifacts
    if (handlerResult.artifacts && handlerResult.artifacts.length > 0) {
      const artifactsToInsert = handlerResult.artifacts.map(a => ({
        ...a,
        run_id: run.id
      }));
      await this.db.insertArtifacts(artifactsToInsert);
      logger.log('info', `Recorded ${artifactsToInsert.length} artifact(s) generated during run.`);
    }

    // 7. Finish Run & Update Task Status
    const isSuccess = handlerResult.exitCode === 0;
    await this.db.finishRun(run.id, {
      exitCode: handlerResult.exitCode,
      summary: handlerResult.summary,
      result: handlerResult.result,
      tokensUsed: handlerResult.tokensUsed,
      costUsd: handlerResult.costUsd
    });

    if (isSuccess) {
      // If task has acceptance criteria, route to verifying, otherwise completed
      const nextStatus = (task.acceptance_criteria && task.acceptance_criteria.length > 0)
        ? 'verifying'
        : 'completed';
      await this.db.updateTaskStatus(task.id, nextStatus);
      logger.log('success', `Task ${task.id} finalized with status: "${nextStatus}".`);
    } else {
      if (task.attempts < task.max_attempts) {
        // Re-queue task for retry
        logger.log('warn', `Task failed (Attempt ${task.attempts}/${task.max_attempts}). Re-queuing for retry...`);
        await this.db.updateTaskStatus(task.id, 'queued', { lease_until: null });
      } else {
        logger.log('error', `Task exceeded maximum attempts (${task.max_attempts}). Marked as failed.`);
        await this.db.updateTaskStatus(task.id, 'failed');
      }
    }

    leaseKeeper.stop();
    this.currentLeaseKeeper = null;
    await logger.close();
    console.log(`[WorkerDaemon] ✔ Finished Task: ${task.id} (Exit: ${handlerResult.exitCode})\n`);
  }
}

// Direct execution entrypoint
if (import.meta.url === `file://${process.argv[1]}`) {
  const daemon = new WorkerDaemon();
  daemon.start().catch(err => {
    console.error('[WorkerDaemon] Fatal startup error:', err);
    process.exit(1);
  });
}
