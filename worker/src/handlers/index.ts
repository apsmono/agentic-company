import { TaskHandler } from '../types.js';
import { echoHandler } from './echo.js';
import { shellHandler } from './shell.js';
import { fileGeneratorHandler } from './file_generator.js';
import { agentDevHandler } from './agent_dev.js';
import { agentReviewHandler } from './agent_review.js';
import { gitMergeHandler } from './git_merge.js';

export class HandlerRegistry {
  private handlers: Map<string, TaskHandler> = new Map();

  constructor() {
    this.register('echo', echoHandler);
    this.register('shell', shellHandler);
    this.register('command', shellHandler);
    this.register('file_generator', fileGeneratorHandler);
    this.register('generate_file', fileGeneratorHandler);
    this.register('report', fileGeneratorHandler);

    // Autonomous coding & governance handlers
    this.register('agent_dev', agentDevHandler);
    this.register('code', agentDevHandler);
    this.register('bugfix', agentDevHandler);
    this.register('refactor', agentDevHandler);

    this.register('agent_review', agentReviewHandler);
    this.register('code_review', agentReviewHandler);
    this.register('audit', agentReviewHandler);

    this.register('git_merge', gitMergeHandler);
    this.register('merge', gitMergeHandler);
  }

  public register(taskType: string, handler: TaskHandler): void {
    this.handlers.set(taskType.toLowerCase(), handler);
  }

  public get(taskType: string): TaskHandler | undefined {
    return this.handlers.get(taskType.toLowerCase());
  }

  public has(taskType: string): boolean {
    return this.handlers.has(taskType.toLowerCase());
  }

  public getSupportedTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}

export const defaultHandlerRegistry = new HandlerRegistry();
