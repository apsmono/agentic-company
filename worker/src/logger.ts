import { LogLevel, RunLog } from './types.js';

export interface LogBatchWriter {
  insertRunLogs(logs: RunLog[]): Promise<void>;
}

export class TaskLogger {
  private buffer: RunLog[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isFlushing = false;
  private closed = false;

  constructor(
    private runId: string,
    private writer: LogBatchWriter,
    private batchIntervalMs: number = 1500
  ) {}

  public log(level: LogLevel, message: string): void {
    const ts = new Date().toISOString();
    const entry: RunLog = {
      run_id: this.runId,
      level,
      message,
      ts
    };

    // Output formatted line to worker console
    this.printToConsole(level, ts, message);

    if (this.closed) return;

    this.buffer.push(entry);

    // If buffer is getting large, flush immediately
    if (this.buffer.length >= 25) {
      void this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushTimer = null;
        void this.flush();
      }, this.batchIntervalMs);
    }
  }

  public async flush(): Promise<void> {
    if (this.isFlushing || this.buffer.length === 0) return;
    this.isFlushing = true;

    // Take current buffer snapshot
    const toInsert = [...this.buffer];
    this.buffer = [];

    try {
      await this.writer.insertRunLogs(toInsert);
    } catch (err) {
      // Put logs back into buffer if write failed and logger not closed
      if (!this.closed) {
        this.buffer = [...toInsert, ...this.buffer];
      }
      console.error(`[WorkerLogger] Failed to flush ${toInsert.length} logs for run ${this.runId}:`, err);
    } finally {
      this.isFlushing = false;
    }
  }

  public async close(): Promise<void> {
    this.closed = true;
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }

  private printToConsole(level: LogLevel, ts: string, message: string): void {
    const timeStr = ts.split('T')[1]?.replace('Z', '') || ts;
    const prefix = `[${timeStr}] [${level.toUpperCase()}]`;
    switch (level) {
      case 'error':
        console.error(`\x1b[31m${prefix} ${message}\x1b[0m`);
        break;
      case 'warn':
        console.warn(`\x1b[33m${prefix} ${message}\x1b[0m`);
        break;
      case 'success':
        console.log(`\x1b[32m${prefix} ${message}\x1b[0m`);
        break;
      case 'info':
      default:
        console.log(`\x1b[36m${prefix}\x1b[0m ${message}`);
        break;
    }
  }
}
