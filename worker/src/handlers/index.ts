import { TaskHandler } from '../types.js';
import { echoHandler } from './echo.js';
import { shellHandler } from './shell.js';
import { fileGeneratorHandler } from './file_generator.js';

export class HandlerRegistry {
  private handlers: Map<string, TaskHandler> = new Map();

  constructor() {
    this.register('echo', echoHandler);
    this.register('shell', shellHandler);
    this.register('command', shellHandler);
    this.register('file_generator', fileGeneratorHandler);
    this.register('generate_file', fileGeneratorHandler);
    this.register('report', fileGeneratorHandler);
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
