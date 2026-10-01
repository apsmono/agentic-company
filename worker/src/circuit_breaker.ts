import fs from 'fs';
import path from 'path';
import { DatabaseService } from './db.js';

export interface CircuitBreakerStatus {
  allowExecution: boolean;
  tripped: boolean;
  reason?: string;
  currentSpendUsd: number;
  dailyCapUsd: number;
  killSwitchActive: boolean;
}

export class FinancialCircuitBreaker {
  private killSwitchPath: string;

  constructor(
    private dailyCapUsd: number = 15.0,
    baseDir?: string
  ) {
    const root = baseDir || process.cwd();
    this.killSwitchPath = path.join(root, '.kill_switch_active');
  }

  public isKillSwitchActive(): boolean {
    if (process.env.KILL_SWITCH_ACTIVE === 'true') return true;
    try {
      return fs.existsSync(this.killSwitchPath);
    } catch {
      return false;
    }
  }

  public setKillSwitch(active: boolean): void {
    try {
      if (active) {
        fs.writeFileSync(this.killSwitchPath, `Activated at ${new Date().toISOString()}`, 'utf-8');
      } else {
        if (fs.existsSync(this.killSwitchPath)) {
          fs.unlinkSync(this.killSwitchPath);
        }
      }
    } catch (err) {
      console.warn('[CircuitBreaker] Failed to toggle kill switch file:', err);
    }
  }

  public async evaluateSafety(db: DatabaseService): Promise<CircuitBreakerStatus> {
    const killSwitch = this.isKillSwitchActive();
    if (killSwitch) {
      return {
        allowExecution: false,
        tripped: true,
        reason: 'Emergency Kill Switch is ACTIVE. All worker execution halted.',
        currentSpendUsd: 0,
        dailyCapUsd: this.dailyCapUsd,
        killSwitchActive: true
      };
    }

    const currentSpend = await db.getTodaySpend();
    if (currentSpend >= this.dailyCapUsd) {
      return {
        allowExecution: false,
        tripped: true,
        reason: `Daily budget limit reached ($${currentSpend.toFixed(2)} / $${this.dailyCapUsd.toFixed(2)}). Polling paused to prevent runaway cost.`,
        currentSpendUsd: currentSpend,
        dailyCapUsd: this.dailyCapUsd,
        killSwitchActive: false
      };
    }

    return {
      allowExecution: true,
      tripped: false,
      currentSpendUsd: currentSpend,
      dailyCapUsd: this.dailyCapUsd,
      killSwitchActive: false
    };
  }
}

export const defaultCircuitBreaker = new FinancialCircuitBreaker(
  parseFloat(process.env.DAILY_BUDGET_CAP_USD || '15.00')
);
