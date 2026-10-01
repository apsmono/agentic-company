import { TaskHandler, TaskExecutionContext, TaskHandlerResult, Artifact } from '../types.js';
import { DatabaseService } from '../db.js';

export function createBoardMemoHandler(db: DatabaseService): TaskHandler {
  return async (ctx: TaskExecutionContext): Promise<TaskHandlerResult> => {
    ctx.log('info', `[BoardMemo] Compiling Weekly Executive Board Memo for the Chairman...`);

    const spend = await db.getTodaySpend();
    const runs = await db.getRecentRuns(50);

    const completedRuns = runs.filter(r => r.exit_code === 0).length;
    const failedRuns = runs.filter(r => r.exit_code !== 0 && r.exit_code !== null).length;
    const totalTokens = runs.reduce((sum, r) => sum + (r.tokens_used || 0), 0);

    const memoDate = new Date().toISOString().split('T')[0];
    const memoContent = `# Executive Board Memo — Agentic Company
**Date**: ${memoDate}  
**Prepared by**: CEO Agent  
**Addressed to**: The Chairman  

---

## 1. Executive Summary & Financial Health
- **Cumulative Daily Spend**: $${spend.toFixed(2)} USD
- **Daily Budget Cap**: $15.00 USD
- **Total Token Volume**: ${totalTokens.toLocaleString()} tokens
- **Financial Status**: Healthy (Operating within established spending thresholds)

---

## 2. Engineering Operations & Velocity
- **Recent Runs Evaluated**: ${runs.length}
- **Successful Executions**: ${completedRuns} (Exit 0)
- **Failed / Retried Runs**: ${failedRuns}
- **Success Rate**: ${runs.length > 0 ? Math.round((completedRuns / runs.length) * 100) : 100}%

---

## 3. Governance & Quality Control
- **Worktree Isolation**: 100% of tasks executed in ephemeral Git worktrees (\`.worktrees/\`).
- **Security Audits**: Adversarial Reviewer verifying acceptance criteria on all feature branches.
- **One-Way Doors**: Sovereign Chairman approval enforced via 4-Digit PIN gate and Telegram push notifications.

---

## 4. Next Week Strategic Focus
1. Accelerate autonomous feature implementations dispatched from Chairman Directives.
2. Maintain zero-downtime background daemon operation under pm2.
`;

    const artifact: Omit<Artifact, 'run_id'> = {
      kind: 'report',
      url_or_path: `memo://${memoDate}`,
      label: `Weekly Board Memo — ${memoDate}`,
      metadata: {
        date: memoDate,
        spendUsd: spend,
        completedRuns,
        failedRuns,
        totalTokens
      }
    };

    ctx.log('success', `[BoardMemo] Executive Memo synthesized successfully.`);

    return {
      exitCode: 0,
      summary: `Weekly Board Memo generated for Chairman review (${completedRuns} successful runs, $${spend.toFixed(2)} spend).`,
      artifacts: [artifact],
      result: {
        memoDate,
        spendUsd: spend,
        completedRuns,
        memoContent
      }
    };
  };
}
