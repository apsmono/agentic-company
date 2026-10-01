import { DatabaseService } from './db.js';
import { WorkerConfig } from './config.js';
import { WorkerInfo } from './types.js';

/**
 * Manages periodic worker node telemetry and heartbeat updates in the workers table.
 */
export class WorkerHeartbeatManager {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    private db: DatabaseService,
    private config: WorkerConfig
  ) {}

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Send immediate initial heartbeat
    void this.ping('active');

    // Schedule periodic heartbeats
    this.timer = setInterval(() => {
      void this.ping('active');
    }, this.config.heartbeatIntervalSeconds * 1000);
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    // Final heartbeat marking worker as stopped
    await this.ping('stopped');
  }

  private async ping(status: 'active' | 'draining' | 'stopped'): Promise<void> {
    const mem = process.memoryUsage();
    const info: WorkerInfo = {
      id: this.config.workerId,
      host: this.config.workerHost,
      capabilities: this.config.capabilities,
      last_heartbeat: new Date().toISOString(),
      status,
      metadata: {
        pid: process.pid,
        nodeVersion: process.version,
        rssMb: Math.round(mem.rss / 1024 / 1024),
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        uptimeSec: Math.round(process.uptime())
      }
    };

    try {
      await this.db.updateWorkerHeartbeat(info);
    } catch (err) {
      console.warn('[WorkerHeartbeat] Failed to ping database:', err);
    }
  }
}

/**
 * Manages lease renewals for actively running tasks to prevent timeout reclaim by other workers.
 */
export class TaskLeaseKeeper {
  private timer: NodeJS.Timeout | null = null;
  private cancelled = false;

  constructor(
    private taskId: string,
    private db: DatabaseService,
    private leaseDurationSeconds: number,
    private renewalIntervalMs: number = 30000
  ) {}

  public start(): void {
    this.cancelled = false;
    this.timer = setInterval(async () => {
      try {
        const renewed = await this.db.renewTaskLease(this.taskId, this.leaseDurationSeconds);
        if (!renewed) {
          console.warn(`[LeaseKeeper] Failed to renew lease for task ${this.taskId}. It may have been reassigned.`);
          this.cancelled = true;
        }
      } catch (err) {
        console.warn(`[LeaseKeeper] Error renewing lease for task ${this.taskId}:`, err);
      }
    }, this.renewalIntervalMs);
  }

  public isCancelled(): boolean {
    return this.cancelled;
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public async releaseImmediate(): Promise<void> {
    this.stop();
    try {
      await this.db.releaseTaskLease(this.taskId);
    } catch {
      // Ignored during shutdown
    }
  }
}
