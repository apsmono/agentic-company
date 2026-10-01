import { TaskHandler, TaskExecutionContext, TaskHandlerResult } from '../types.js';

export const echoHandler: TaskHandler = async (ctx: TaskExecutionContext): Promise<TaskHandlerResult> => {
  ctx.log('info', `Executing diagnostic echo handler for task: ${ctx.task.id}`);
  
  const message = ctx.task.payload.message || 'Diagnostic ping OK';
  ctx.log('info', `Echo payload message: "${message}"`);
  
  // Emulate brief processing delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  ctx.log('success', 'Diagnostic echo completed successfully.');

  return {
    exitCode: 0,
    summary: `Echo executed successfully: ${message}`,
    result: {
      echo: message,
      executedBy: ctx.workerId,
      timestamp: new Date().toISOString()
    }
  };
};
