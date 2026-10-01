import { TaskHandler, TaskExecutionContext, TaskHandlerResult, Artifact } from '../types.js';
import { defaultWorktreeManager } from '../worktree.js';
import { AgentSandbox } from '../agent/sandbox.js';
import { AgentToolHarness } from '../agent/tools.js';

export const agentDevHandler: TaskHandler = async (ctx: TaskExecutionContext): Promise<TaskHandlerResult> => {
  ctx.log('info', `[DevWorker] Initializing development task ${ctx.task.id} (Agent: ${ctx.task.owner_agent || 'dev-1'})`);

  const allowedTools = ['readFile', 'writeFile', 'listFiles', 'runTest', 'gitCommit'];
  let worktree;

  try {
    // 1. Create isolated worktree for this task
    ctx.log('info', `[DevWorker] Provisioning isolated git worktree: .worktrees/task-${ctx.task.id}`);
    worktree = await defaultWorktreeManager.createWorktree(ctx.task.id);
    ctx.log('success', `[DevWorker] Worktree active at ${worktree.worktreePath} on branch "${worktree.branchName}"`);

    // 2. Setup sandbox and tool harness
    const sandbox = new AgentSandbox(worktree.worktreePath);
    const harness = new AgentToolHarness(sandbox, worktree, allowedTools, ctx.log);

    // 3. Process file edits / creations from payload
    const filesToCreate = ctx.task.payload.files_to_create as Array<{ path: string; content: string }> || [];
    for (const f of filesToCreate) {
      const res = await harness.executeTool('writeFile', { path: f.path, content: f.content });
      if (!res.success) {
        throw new Error(`Failed to write file ${f.path}: ${res.output}`);
      }
    }

    // 4. Run test verification (if test command specified in payload)
    const testCommand = ctx.task.payload.test_command as { cmd: string; args?: string[] } | undefined;
    if (testCommand) {
      ctx.log('info', `[DevWorker] Running verification test suite: ${testCommand.cmd} ${(testCommand.args || []).join(' ')}`);
      const testRes = await harness.executeTool('runTest', {
        command: testCommand.cmd,
        args: testCommand.args || []
      });

      if (!testRes.success) {
        ctx.log('error', `[DevWorker] Automated test suite failed. Dev Worker cannot finish with failing tests.`);
        return {
          exitCode: 1,
          summary: `Test verification failed: ${testRes.output}`,
          result: { testOutput: testRes.output, branch: worktree.branchName }
        };
      }
      ctx.log('success', `[DevWorker] All automated tests passed with Exit 0.`);
    }

    // 5. Commit changes to task branch
    const commitMsg = String(ctx.task.payload.commit_message || `feat: implement ${ctx.task.id} requirements`);
    const commitRes = await harness.executeTool('gitCommit', { message: `${commitMsg} [${ctx.task.id}]` });
    ctx.log('info', `[DevWorker] Changes committed to ${worktree.branchName}: ${commitRes.output.trim()}`);

    // 6. Capture git diff
    const diff = await defaultWorktreeManager.getWorktreeDiff(worktree.worktreePath);
    const artifacts: Omit<Artifact, 'run_id'>[] = [];

    if (diff.trim().length > 0) {
      artifacts.push({
        kind: 'diff',
        url_or_path: `branch://${worktree.branchName}`,
        label: `PR Diff: ${worktree.branchName}`,
        metadata: {
          branch: worktree.branchName,
          diffLines: diff.split('\n').length,
          taskId: ctx.task.id
        }
      });
    }

    return {
      exitCode: 0,
      summary: `Dev Worker completed implementation on branch "${worktree.branchName}". Ready for review.`,
      artifacts,
      result: {
        branch: worktree.branchName,
        diffExcerpt: diff.substring(0, 1000),
        status: 'ready_for_review'
      }
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    ctx.log('error', `[DevWorker] Execution aborted: ${msg}`);
    return {
      exitCode: 1,
      summary: `Dev Worker failed: ${msg}`,
      result: { error: msg }
    };
  } finally {
    // 7. Cleanup worktree directory safely
    if (worktree) {
      ctx.log('info', `[DevWorker] Tearing down isolated worktree: ${worktree.worktreePath}`);
      await worktree.remove();
    }
  }
};
