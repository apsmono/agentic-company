import { TaskHandler, TaskExecutionContext, TaskHandlerResult, Artifact } from '../types.js';
import { defaultWorktreeManager } from '../worktree.js';

export const gitMergeHandler: TaskHandler = async (ctx: TaskExecutionContext): Promise<TaskHandlerResult> => {
  const branchName = String(ctx.task.payload.branch_name || `task/${ctx.task.id}`);
  const commitMsg = String(ctx.task.payload.commit_message || `chore: merge ${branchName} into main [${ctx.task.id}]`);

  ctx.log('info', `[GitMerge] Executing Chairman-approved One-Way Door merge of "${branchName}" into main`);

  // Verify task was approved if marked one_way
  if (ctx.task.door === 'one_way' && ctx.task.status === 'approval_pending') {
    ctx.log('error', `[GitMerge] Unauthorized merge attempt: Task is still in approval_pending status.`);
    return {
      exitCode: 1,
      summary: 'Cannot merge branch: Chairman approval is pending.'
    };
  }

  const { success, output } = await defaultWorktreeManager.mergeBranchToMain(branchName, commitMsg);

  if (success) {
    ctx.log('success', `[GitMerge] ${output}`);
    const artifact: Omit<Artifact, 'run_id'> = {
      kind: 'pr',
      url_or_path: `git://merge/${branchName}`,
      label: `Merged: ${branchName} -> main`,
      metadata: { branch: branchName, timestamp: new Date().toISOString() }
    };

    return {
      exitCode: 0,
      summary: `Branch ${branchName} successfully merged into main.`,
      artifacts: [artifact],
      result: { mergedBranch: branchName, output }
    };
  } else {
    ctx.log('error', `[GitMerge] Merge failed: ${output}`);
    return {
      exitCode: 1,
      summary: `Merge failed: ${output}`,
      result: { error: output }
    };
  }
};
