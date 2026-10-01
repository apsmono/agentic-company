import { spawn } from 'child_process';
import { TaskHandler, TaskExecutionContext, TaskHandlerResult } from '../types.js';

export const shellHandler: TaskHandler = async (ctx: TaskExecutionContext): Promise<TaskHandlerResult> => {
  const { command, args = [], cwd, timeout_seconds = 120, requires_approval, approval_action } = ctx.task.payload;

  if (!command) {
    ctx.log('error', 'Shell execution failed: No "command" specified in payload.');
    return {
      exitCode: 1,
      summary: 'Missing required "command" in task payload.'
    };
  }

  // 1-Way Door Governance Check
  if (ctx.task.door === 'one_way' || requires_approval) {
    ctx.log('warn', `Task ${ctx.task.id} requires 1-Way Door Chairman approval before execution.`);
    return {
      exitCode: 0,
      summary: 'Task paused waiting for Chairman PIN approval on 1-Way Door action.',
      requestApproval: {
        action: approval_action || `Execute shell command: ${command} ${args.join(' ')}`.trim(),
        note: `Triggered by task ${ctx.task.id} on worker ${ctx.workerId}`
      }
    };
  }

  const startTime = Date.now();
  const workDir = cwd || process.cwd();
  const fullCommandDisplay = args && args.length > 0 ? `${command} ${args.join(' ')}` : command;
  ctx.log('info', `Spawning process: ${fullCommandDisplay} (cwd: ${workDir})`);

  return new Promise((resolve) => {
    let killedByTimeout = false;
    let killedByCancel = false;

    // If args are provided, spawn directly without shell to avoid argument quoting / globbing issues
    // If no args provided and command has spaces, spawn via shell
    const hasArgs = Array.isArray(args) && args.length > 0;
    const child = hasArgs
      ? spawn(command, args, {
          cwd: workDir,
          shell: false,
          env: { ...process.env, AGENTIC_WORKER_ID: ctx.workerId, AGENTIC_TASK_ID: ctx.task.id }
        })
      : spawn(command, {
          cwd: workDir,
          shell: true,
          env: { ...process.env, AGENTIC_WORKER_ID: ctx.workerId, AGENTIC_TASK_ID: ctx.task.id }
        });

    const timeoutTimer = setTimeout(() => {
      killedByTimeout = true;
      ctx.log('error', `Process exceeded maximum execution timeout of ${timeout_seconds}s. Terminating...`);
      child.kill('SIGTERM');
    }, timeout_seconds * 1000);

    // Cancel monitor
    const cancelChecker = setInterval(() => {
      if (ctx.isCancelled()) {
        killedByCancel = true;
        ctx.log('warn', 'Execution cancelled by lease keeper or worker shutdown. Terminating process...');
        child.kill('SIGTERM');
      }
    }, 1000);

    let stdoutBuffer = '';
    let stderrBuffer = '';

    child.stdout.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      stdoutBuffer += text;
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.trim().length > 0) {
          ctx.log('info', line);
        }
      }
    });

    child.stderr.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      stderrBuffer += text;
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.trim().length > 0) {
          ctx.log('warn', line);
        }
      }
    });

    child.on('error', (err: Error) => {
      clearTimeout(timeoutTimer);
      clearInterval(cancelChecker);
      ctx.log('error', `Subprocess failed to start: ${err.message}`);
      resolve({
        exitCode: 127,
        summary: `Subprocess spawn error: ${err.message}`,
        result: { error: err.message, durationMs: Date.now() - startTime }
      });
    });

    child.on('close', (code: number | null) => {
      clearTimeout(timeoutTimer);
      clearInterval(cancelChecker);
      const durationMs = Date.now() - startTime;
      const exitCode = killedByTimeout ? 124 : killedByCancel ? 130 : (code ?? 0);

      if (exitCode === 0) {
        ctx.log('success', `Process completed successfully (Exit 0) in ${(durationMs / 1000).toFixed(2)}s.`);
      } else {
        ctx.log('error', `Process terminated with non-zero exit code: ${exitCode}`);
      }

      resolve({
        exitCode,
        summary: exitCode === 0 
          ? `Command completed successfully in ${(durationMs / 1000).toFixed(2)}s.`
          : `Command failed with exit code ${exitCode}.`,
        result: {
          command,
          args,
          cwd: workDir,
          exitCode,
          durationMs,
          stdoutLength: stdoutBuffer.length,
          stderrLength: stderrBuffer.length
        }
      });
    });
  });
};
