import { MockDatabaseService } from '../src/db.js';
import { WorkerDaemon } from '../src/index.js';
import { Task } from '../src/types.js';

async function runIntegrationTests(): Promise<void> {
  console.log('\n======================================================');
  console.log('🧪 Starting Agentic Company Worker Integration Test Suite');
  console.log('======================================================\n');

  const mockDb = new MockDatabaseService(false);
  const daemon = new WorkerDaemon(
    {
      workerId: 'test-runner-01',
      pollIntervalMs: 100,
      leaseDurationSeconds: 10,
      logBatchIntervalMs: 50
    },
    mockDb
  );

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
  // TEST 1: Diagnostic Echo Handler & Log Streaming
  // --------------------------------------------------------------------------
  console.log('--- Test 1: Echo Handler & Log Streaming ---');
  const echoTask: Task = {
    id: 'test_task_echo_01',
    type: 'echo',
    door: 'two_way',
    status: 'queued',
    priority: 'high',
    attempts: 0,
    max_attempts: 3,
    payload: { message: 'Integration test echo payload' }
  };
  mockDb.addTask(echoTask);

  const claimed1 = await mockDb.claimNextTask('test-runner-01', 10);
  assert(claimed1 !== null && claimed1.id === echoTask.id, 'Task claimed via queue consumer');
  
  if (claimed1) {
    await daemon.executeTask(claimed1);
    const updated = mockDb.getTask(echoTask.id);
    assert(updated?.status === 'completed', 'Task transitioned to "completed"');

    const logs = mockDb.getLogs(claimed1.id);
    // Find logs for this task's run
    const hasLogMessage = mockDb['logs'].some(l => l.message.includes('Diagnostic echo completed'));
    assert(hasLogMessage, 'Streaming logs captured in database');
  }

  // --------------------------------------------------------------------------
  // TEST 2: Shell Command Handler & Stdout Capture
  // --------------------------------------------------------------------------
  console.log('\n--- Test 2: Shell Command Subprocess Runner ---');
  const shellTask: Task = {
    id: 'test_task_shell_02',
    type: 'shell',
    door: 'two_way',
    status: 'queued',
    priority: 'urgent',
    attempts: 0,
    max_attempts: 3,
    payload: {
      command: 'node',
      args: ['-e', 'console.log("HELLO_FROM_SHELL_SUBPROCESS"); process.stdout.write("SECOND_LINE\\n");']
    }
  };
  mockDb.addTask(shellTask);

  const claimed2 = await mockDb.claimNextTask('test-runner-01', 10);
  assert(claimed2 !== null && claimed2.id === shellTask.id, 'Shell task claimed with urgent priority');

  if (claimed2) {
    await daemon.executeTask(claimed2);
    const updated = mockDb.getTask(shellTask.id);
    assert(updated?.status === 'completed', 'Shell task finished with completed status');

    const capturedStdout = mockDb['logs'].some(l => l.message.includes('HELLO_FROM_SHELL_SUBPROCESS'));
    assert(capturedStdout, 'Child process stdout streamed to run_logs');
  }

  // --------------------------------------------------------------------------
  // TEST 3: Artifact Generator & File Persistence
  // --------------------------------------------------------------------------
  console.log('\n--- Test 3: Artifact Generator ---');
  const artifactTask: Task = {
    id: 'test_task_artifact_03',
    type: 'file_generator',
    door: 'two_way',
    status: 'queued',
    priority: 'medium',
    attempts: 0,
    max_attempts: 3,
    payload: {
      output_filename: 'integration_report.md',
      output_content: '# Integration Test Report\nGenerated successfully.',
      file_kind: 'report',
      artifact_label: 'Integration Test Report'
    }
  };
  mockDb.addTask(artifactTask);

  const claimed3 = await mockDb.claimNextTask('test-runner-01', 10);
  assert(claimed3 !== null && claimed3.id === artifactTask.id, 'Artifact task claimed');

  if (claimed3) {
    await daemon.executeTask(claimed3);
    const updated = mockDb.getTask(artifactTask.id);
    assert(updated?.status === 'completed', 'Artifact task completed');

    const artifacts = mockDb['artifacts'].filter(a => a.label === 'Integration Test Report');
    assert(artifacts.length > 0, 'Artifact recorded in artifacts table with kind and metadata');
  }

  // --------------------------------------------------------------------------
  // TEST 4: One-Way Door Governance Hook (Chairman Gate)
  // --------------------------------------------------------------------------
  console.log('\n--- Test 4: One-Way Door Governance Hook ---');
  const oneWayTask: Task = {
    id: 'test_task_oneway_04',
    type: 'shell',
    door: 'one_way',
    status: 'queued',
    priority: 'urgent',
    attempts: 0,
    max_attempts: 3,
    payload: {
      command: 'git',
      args: ['push', 'origin', 'main'],
      requires_approval: true,
      approval_action: 'Push directly to origin/main'
    }
  };
  mockDb.addTask(oneWayTask);

  const claimed4 = await mockDb.claimNextTask('test-runner-01', 10);
  assert(claimed4 !== null && claimed4.id === oneWayTask.id, '1-Way task claimed');

  if (claimed4) {
    await daemon.executeTask(claimed4);
    const updated = mockDb.getTask(oneWayTask.id);
    assert(updated?.status === 'approval_pending', '1-Way task paused with status "approval_pending"');

    const pendingApprovals = mockDb['approvals'].filter(a => a.task_id === oneWayTask.id);
    assert(pendingApprovals.length > 0 && pendingApprovals[0].decision === 'pending', 'Approval ticket created for Chairman review');
  }

  // --------------------------------------------------------------------------
  // TEST 5: Crash Recovery & Expired Lease Reclaim
  // --------------------------------------------------------------------------
  console.log('\n--- Test 5: Crash Resilience & Expired Lease Reclaim ---');
  const crashTask: Task = {
    id: 'test_task_crash_05',
    type: 'echo',
    door: 'two_way',
    status: 'running',
    priority: 'high',
    attempts: 1,
    max_attempts: 3,
    // Simulate expired lease from a killed worker
    lease_until: new Date(Date.now() - 60000).toISOString(),
    payload: { message: 'Recovered task after worker crash' }
  };
  mockDb.addTask(crashTask);

  // Next worker polling should reclaim this crashed task because lease expired
  const reclaimed = await mockDb.claimNextTask('test-runner-02', 10);
  assert(reclaimed !== null && reclaimed.id === crashTask.id, 'Crashed task reclaimed by second worker via expired lease');
  assert(reclaimed !== null && reclaimed.attempts === 2, 'Task attempt counter incremented on reclaim');

  if (reclaimed) {
    await daemon.executeTask(reclaimed);
    const updated = mockDb.getTask(crashTask.id);
    assert(updated?.status === 'completed', 'Reclaimed task successfully executed to completion');
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

runIntegrationTests().catch(err => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
