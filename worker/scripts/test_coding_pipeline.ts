import { MockDatabaseService } from '../src/db.js';
import { WorkerDaemon } from '../src/index.js';
import { Task } from '../src/types.js';
import { defaultWorktreeManager } from '../src/worktree.js';
import { AgentSandbox, SecurityViolationError } from '../src/agent/sandbox.js';
import { AgentToolHarness } from '../src/agent/tools.js';

async function runPipelineTests(): Promise<void> {
  console.log('\n======================================================');
  console.log('🧪 Starting Autonomous Roles & Coding Pipeline Test Suite');
  console.log('======================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, failureDetail?: string): void {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      if (failureDetail) console.error(`     Detail: ${failureDetail}`);
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Security Sandbox & Secret Protection Guardrails
  // --------------------------------------------------------------------------
  console.log('--- Test 1: Security Sandbox Guardrails ---');
  const dummyWorktreePath = process.cwd();
  const sandbox = new AgentSandbox(dummyWorktreePath);

  let trappedEnvRead = false;
  try {
    sandbox.safeResolve('.env');
  } catch (err) {
    if (err instanceof SecurityViolationError) trappedEnvRead = true;
  }
  assert(trappedEnvRead, 'Sandbox blocks reading .env files');

  let trappedTraversal = false;
  try {
    sandbox.safeResolve('../../outside_repo/secret.txt');
  } catch (err) {
    if (err instanceof SecurityViolationError) trappedTraversal = true;
  }
  assert(trappedTraversal, 'Sandbox blocks directory traversal attacks');

  // --------------------------------------------------------------------------
  // TEST 2: Agent Tool Harness Permission Whitelist
  // --------------------------------------------------------------------------
  console.log('\n--- Test 2: Tool Harness Whitelist ---');
  const mockWorktreeCtx = {
    worktreePath: dummyWorktreePath,
    branchName: 'task/test',
    repoRoot: dummyWorktreePath,
    taskId: 'test_task',
    remove: async () => {}
  };
  const harness = new AgentToolHarness(sandbox, mockWorktreeCtx, ['readFile', 'listFiles'], () => {});

  const deniedResult = await harness.executeTool('gitCommit', { message: 'illegal commit' });
  assert(!deniedResult.success && deniedResult.output.includes('Permission denied'), 'Harness rejects tools not in role whitelist');

  // --------------------------------------------------------------------------
  // TEST 3: Worktree Lifecycle & Isolation
  // --------------------------------------------------------------------------
  console.log('\n--- Test 3: Git Worktree Lifecycle & Isolation ---');
  const testTaskId = `unit_${Date.now()}`;
  const worktree = await defaultWorktreeManager.createWorktree(testTaskId);

  assert(worktree.worktreePath.includes('.worktrees'), 'Worktree created in isolated .worktrees directory');
  assert(worktree.branchName === `task/${testTaskId}`, 'Dedicated branch created for task');

  // Teardown
  await worktree.remove();
  let worktreeRemoved = false;
  try {
    const { access } = await import('fs/promises');
    await access(worktree.worktreePath);
  } catch {
    worktreeRemoved = true;
  }
  assert(worktreeRemoved, 'Worktree directory cleaned up and pruned');

  // --------------------------------------------------------------------------
  // TEST 4: Dev Worker End-to-End Coding Task
  // --------------------------------------------------------------------------
  console.log('\n--- Test 4: Dev Worker End-to-End Coding Task ---');
  const mockDb = new MockDatabaseService(false);
  const daemon = new WorkerDaemon(
    {
      workerId: 'dev-runner-01',
      pollIntervalMs: 50,
      leaseDurationSeconds: 15,
      logBatchIntervalMs: 50
    },
    mockDb
  );

  const devTask: Task = {
    id: `dev_${Date.now()}`,
    type: 'agent_dev',
    owner_agent: 'dev-1',
    door: 'two_way',
    status: 'queued',
    priority: 'urgent',
    attempts: 0,
    max_attempts: 3,
    acceptance_criteria: [
      'Must implement utility function',
      'Must include executable unit test'
    ],
    payload: {
      files_to_create: [
        {
          path: 'temp_feature/math_util.js',
          content: 'export function add(a, b) { return a + b; }\n'
        },
        {
          path: 'temp_feature/math_util.test.js',
          content: `
            import { add } from './math_util.js';
            import assert from 'assert';
            assert.strictEqual(add(2, 3), 5);
            console.log('MATH_TEST_PASSED');
          `
        }
      ],
      test_command: {
        cmd: 'node',
        args: ['temp_feature/math_util.test.js']
      },
      commit_message: 'feat(math): add math_util utility and test'
    }
  };

  mockDb.addTask(devTask);
  const claimedDev = await mockDb.claimNextTask('dev-runner-01', 15);
  assert(claimedDev !== null && claimedDev.id === devTask.id, 'Dev task claimed from queue');

  if (claimedDev) {
    await daemon.executeTask(claimedDev);
    const updatedDev = mockDb.getTask(devTask.id);
    assert(updatedDev?.status === 'verifying', 'Dev task transitioned to "verifying" (ready for reviewer)');

    const hasTestPassLog = mockDb['logs'].some(l => l.message.includes('MATH_TEST_PASSED'));
    assert(hasTestPassLog, 'Unit test executed and captured in run_logs');
  }

  // --------------------------------------------------------------------------
  // TEST 5: Reviewer Agent Acceptance Criteria Audit & 1-Way Door Request
  // --------------------------------------------------------------------------
  console.log('\n--- Test 5: Reviewer Agent Audit & 1-Way Door Gate ---');
  const reviewTask: Task = {
    id: devTask.id, // Auditing same task branch
    type: 'agent_review',
    owner_agent: 'reviewer',
    door: 'one_way',
    status: 'queued',
    priority: 'high',
    attempts: 0,
    max_attempts: 3,
    acceptance_criteria: [
      'Must implement utility function',
      'Must include executable unit test'
    ],
    payload: {}
  };

  mockDb.addTask(reviewTask);
  const claimedReview = await mockDb.claimNextTask('reviewer-01', 15);
  assert(claimedReview !== null, 'Reviewer task claimed from queue');

  if (claimedReview) {
    await daemon.executeTask(claimedReview);
    const updatedReview = mockDb.getTask(reviewTask.id);
    assert(updatedReview?.status === 'approval_pending', 'Task paused in "approval_pending" for Chairman PIN sign-off');

    const approvalTicket = mockDb['approvals'].find(a => a.task_id === reviewTask.id);
    assert(approvalTicket !== undefined && approvalTicket.decision === 'pending', 'One-Way Door approval ticket registered');
  }

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log(`📊 Test Results: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('======================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runPipelineTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
