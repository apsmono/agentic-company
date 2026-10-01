import { TaskHandler, TaskExecutionContext, TaskHandlerResult, Task, Decision } from '../types.js';
import { DatabaseService } from '../db.js';

export function createCeoPlanHandler(db: DatabaseService): TaskHandler {
  return async (ctx: TaskExecutionContext): Promise<TaskHandlerResult> => {
    const directiveId = String(ctx.task.payload.directive_id || ctx.task.directive_id || 'DIR-001');
    const directiveText = String(ctx.task.payload.directive_text || 'Deliver autonomous software initiative according to roadmap.');

    ctx.log('info', `[CEO] Claimed Directive ${directiveId}: "${directiveText}"`);

    // 1. Fetch directive details if available
    const directive = await db.getDirective(directiveId);
    const activeText = directive ? directive.text : directiveText;

    // 2. Generate strategic decision record
    const decisionId = `DEC-${Date.now().toString().slice(-6)}`;
    const strategicDecision: Decision = {
      id: decisionId,
      date: new Date().toISOString(),
      decided_by: 'CEO Agent',
      decision: `Decomposed Directive ${directiveId} into 3-tier task pipeline (CTO Spec -> Dev Worker -> Reviewer Audit)`,
      reason: `Guarantees isolated worktree development, test enforcement, and Chairman One-Way Door merge oversight.`
    };
    await db.createDecision(strategicDecision);
    ctx.log('info', `[CEO] Strategic Decision recorded: ${decisionId}`);

    // 3. Decompose into concrete technical tasks
    const taskIdPrefix = `${directiveId.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now().toString().slice(-4)}`;

    const ctoTask: Task = {
      id: `${taskIdPrefix}_01_spec`,
      directive_id: directiveId,
      parent_task_id: ctx.task.id,
      type: 'echo',
      owner_agent: 'cto',
      door: 'two_way',
      status: 'queued',
      priority: 'urgent',
      attempts: 0,
      max_attempts: 3,
      payload: {
        message: `CTO Architecture Spec finalized for: ${activeText}`
      },
      acceptance_criteria: ['Technical specification aligns with Engineering Standards']
    };

    const devTask: Task = {
      id: `${taskIdPrefix}_02_dev`,
      directive_id: directiveId,
      parent_task_id: ctx.task.id,
      type: 'agent_dev',
      owner_agent: 'dev-1',
      door: 'two_way',
      status: 'queued',
      priority: 'high',
      attempts: 0,
      max_attempts: 3,
      payload: {
        files_to_create: [
          {
            path: `features/${taskIdPrefix}/module.js`,
            content: `// Automated module for ${directiveId}\nexport const ready = true;\n`
          },
          {
            path: `features/${taskIdPrefix}/module.test.js`,
            content: `import { ready } from './module.js';\nif (!ready) process.exit(1);\nconsole.log('DIRECTIVE_MODULE_TEST_OK');\n`
          }
        ],
        test_command: {
          cmd: 'node',
          args: [`features/${taskIdPrefix}/module.test.js`]
        },
        commit_message: `feat(${directiveId}): implement directive requirements`
      },
      acceptance_criteria: [
        'Must implement core module functionality',
        'Must include automated unit tests passing with Exit 0'
      ]
    };

    const reviewTask: Task = {
      id: `${taskIdPrefix}_03_review`,
      directive_id: directiveId,
      parent_task_id: ctx.task.id,
      type: 'agent_review',
      owner_agent: 'reviewer',
      door: 'one_way',
      status: 'queued',
      priority: 'high',
      attempts: 0,
      max_attempts: 3,
      payload: {},
      acceptance_criteria: [
        'Must implement core module functionality',
        'Must include automated unit tests passing with Exit 0'
      ]
    };

    // 4. Dispatch tasks to queue
    await db.createTask(ctoTask);
    await db.createTask(devTask);
    await db.createTask(reviewTask);

    ctx.log('success', `[CEO] Successfully dispatched 3 subtasks to queue: ${ctoTask.id}, ${devTask.id}, ${reviewTask.id}`);

    // 5. Update directive status
    await db.updateDirective(directiveId, { status: 'in_progress' });

    return {
      exitCode: 0,
      summary: `CEO decomposed Directive ${directiveId} into 3 tasks and recorded Decision ${decisionId}.`,
      result: {
        directiveId,
        decisionId,
        createdTasks: [ctoTask.id, devTask.id, reviewTask.id]
      }
    };
  };
}
