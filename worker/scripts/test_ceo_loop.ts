import { MockDatabaseService } from '../src/db.js';
import { WorkerDaemon } from '../src/index.js';
import { Task, Directive } from '../src/types.js';
import { FinancialCircuitBreaker } from '../src/circuit_breaker.js';
import { TelegramNotifier } from '../src/telegram.js';

async function runCeoLoopTests(): Promise<void> {
  console.log('\n======================================================');
  console.log('🧪 Starting CEO Planning, Circuit Breaker & Alerting Suite');
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

  const mockDb = new MockDatabaseService(false);
  const daemon = new WorkerDaemon(
    {
      workerId: 'ceo-runner-01',
      pollIntervalMs: 50,
      leaseDurationSeconds: 15,
      logBatchIntervalMs: 50
    },
    mockDb
  );

  // --------------------------------------------------------------------------
  // TEST 1: CEO Directive Decomposition Engine
  // --------------------------------------------------------------------------
  console.log('--- Test 1: CEO Directive Decomposition Engine ---');
  const directive: Directive = {
    id: 'DIR-AUTH-001',
    text: 'Implement enterprise OAuth2 authentication with multi-factor support',
    status: 'inbox',
    budget_limit: 15.0,
    created_at: new Date().toISOString()
  };
  mockDb.addDirective(directive);

  const planTask: Task = {
    id: 'task_ceo_decompose_01',
    directive_id: directive.id,
    type: 'ceo_plan',
    owner_agent: 'ceo',
    door: 'two_way',
    status: 'queued',
    priority: 'urgent',
    attempts: 0,
    max_attempts: 3,
    payload: {
      directive_id: directive.id,
      directive_text: directive.text
    }
  };
  mockDb.addTask(planTask);

  const claimedPlan = await mockDb.claimNextTask('ceo-runner-01', 15);
  assert(claimedPlan !== null && claimedPlan.id === planTask.id, 'CEO plan task claimed from queue');

  if (claimedPlan) {
    await daemon.executeTask(claimedPlan);
    const updatedPlan = mockDb.getTask(planTask.id);
    assert(updatedPlan?.status === 'completed', 'CEO plan task completed successfully');

    // Check generated subtasks in tasks table
    const allTasks = Array.from(mockDb['tasks'].values());
    const ctoTask = allTasks.find(t => t.id.includes('_01_spec'));
    const devTask = allTasks.find(t => t.id.includes('_02_dev'));
    const reviewTask = allTasks.find(t => t.id.includes('_03_review'));

    assert(ctoTask !== undefined, 'CTO specification task created');
    assert(devTask !== undefined && (devTask.acceptance_criteria?.length || 0) > 0, 'Dev task created with acceptance criteria');
    assert(reviewTask !== undefined && reviewTask.door === 'one_way', 'Reviewer task created with One-Way Door gate');

    // Check decisions ledger
    const decisions = mockDb.getDecisions();
    assert(decisions.length > 0 && decisions.some(d => d.decided_by === 'CEO Agent'), 'Strategic decision recorded in decisions ledger');

    // Check directive updated to in_progress
    const updatedDirective = await mockDb.getDirective(directive.id);
    assert(updatedDirective?.status === 'in_progress', 'Directive status transitioned to "in_progress"');
  }

  // --------------------------------------------------------------------------
  // TEST 2: Executive Board Memo Generator
  // --------------------------------------------------------------------------
  console.log('\n--- Test 2: Executive Board Memo Generator ---');
  mockDb.clear(); // Fresh queue for memo test
  const memoTask: Task = {
    id: 'task_board_memo_02',
    type: 'board_memo',
    owner_agent: 'ceo',
    door: 'two_way',
    status: 'queued',
    priority: 'high',
    attempts: 0,
    max_attempts: 3,
    payload: {}
  };
  mockDb.addTask(memoTask);

  const claimedMemo = await mockDb.claimNextTask('ceo-runner-01', 15);
  assert(claimedMemo !== null && claimedMemo.id === memoTask.id, 'Board memo task claimed');

  if (claimedMemo) {
    await daemon.executeTask(claimedMemo);
    const updatedMemo = mockDb.getTask(memoTask.id);
    assert(updatedMemo?.status === 'completed', 'Board memo task completed');

    const memoArtifact = mockDb['artifacts'].find(a => a.label?.includes('Weekly Board Memo'));
    assert(memoArtifact !== undefined && memoArtifact.kind === 'report', 'Executive Board Memo artifact recorded');
  }

  // --------------------------------------------------------------------------
  // TEST 3: Financial Circuit Breakers & Kill Switch
  // --------------------------------------------------------------------------
  console.log('\n--- Test 3: Financial Circuit Breakers ---');
  const circuitBreaker = new FinancialCircuitBreaker(15.0, process.cwd());

  // Initial state should be healthy
  const healthyStatus = await circuitBreaker.evaluateSafety(mockDb);
  assert(healthyStatus.allowExecution && !healthyStatus.tripped, 'Circuit breaker allows execution within budget');

  // Simulate runaway spend exceeding $15 cap
  const heavyRun = await mockDb.createRun('task_sim_01');
  await mockDb.finishRun(heavyRun.id, {
    exitCode: 0,
    summary: 'Heavy LLM task',
    tokensUsed: 800000,
    costUsd: 18.50
  });

  const trippedStatus = await circuitBreaker.evaluateSafety(mockDb);
  assert(!trippedStatus.allowExecution && trippedStatus.tripped, 'Circuit breaker trips when daily cost exceeds ceiling');
  assert(trippedStatus.reason?.includes('Daily budget limit reached') === true, 'Circuit breaker gives clear spend reason');

  // Test Emergency Kill Switch
  circuitBreaker.setKillSwitch(true);
  const killStatus = await circuitBreaker.evaluateSafety(mockDb);
  assert(!killStatus.allowExecution && killStatus.killSwitchActive, 'Emergency Kill Switch unconditionally halts worker execution');
  circuitBreaker.setKillSwitch(false); // Reset

  // --------------------------------------------------------------------------
  // TEST 4: Telegram Mobile Push Alerts & Remote /approve Command
  // --------------------------------------------------------------------------
  console.log('\n--- Test 4: Telegram Push Alerts & Remote Approval ---');
  const notifier = new TelegramNotifier();

  await notifier.sendApprovalAlert({
    taskId: 'task_oneway_test_99',
    action: 'Merge branch task/99 to main',
    requestedBy: 'reviewer',
    note: 'All acceptance criteria passed.'
  });

  const alerts = notifier.getSentAlerts();
  assert(alerts.length > 0 && alerts[0].type === 'approval', 'Telegram push alert dispatched for One-Way Door action');
  assert(alerts[0].message.includes('/approve task_oneway_test_99'), 'Push alert includes mobile approval command');

  // Test remote /approve command execution
  const testApprovalTask: Task = {
    id: 'task_oneway_test_99',
    type: 'shell',
    door: 'one_way',
    status: 'approval_pending',
    priority: 'urgent',
    attempts: 1,
    max_attempts: 3,
    payload: { command: 'echo', args: ['approved'] }
  };
  mockDb.addTask(testApprovalTask);

  const approveResponse = await notifier.handleCommand('/approve task_oneway_test_99', mockDb);
  assert(approveResponse.includes('approved by Chairman'), 'Remote /approve command executes successfully');

  const reQueuedTask = mockDb.getTask('task_oneway_test_99');
  assert(reQueuedTask?.status === 'queued', 'Approved task re-enqueued for worker execution');

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

runCeoLoopTests().catch(err => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
