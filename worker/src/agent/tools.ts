import { AgentSandbox } from './sandbox.js';
import { WorktreeContext } from '../worktree.js';
import { LogLevel } from '../types.js';

export interface ToolExecutionResult {
  toolName: string;
  success: boolean;
  output: string;
  data?: unknown;
}

export class AgentToolHarness {
  constructor(
    private sandbox: AgentSandbox,
    private worktree: WorktreeContext,
    private allowedTools: string[],
    private log: (level: LogLevel, message: string) => void
  ) {}

  public isToolAllowed(toolName: string): boolean {
    return this.allowedTools.includes(toolName);
  }

  public async executeTool(toolName: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
    if (!this.isToolAllowed(toolName)) {
      this.log('error', `Security Alert: Agent attempted to invoke unauthorized tool: "${toolName}". Allowed: ${this.allowedTools.join(', ')}`);
      return {
        toolName,
        success: false,
        output: `Permission denied: Tool "${toolName}" is not permitted for your agent role.`
      };
    }

    try {
      switch (toolName) {
        case 'readFile': {
          const filePath = String(args.path || args.filename || '');
          this.log('info', `[Tool:readFile] Reading ${filePath}`);
          const content = await this.sandbox.readFile(filePath);
          return { toolName, success: true, output: content };
        }

        case 'writeFile': {
          const filePath = String(args.path || args.filename || '');
          const content = String(args.content || '');
          this.log('info', `[Tool:writeFile] Writing ${filePath} (${content.length} chars)`);
          await this.sandbox.writeFile(filePath, content);
          return { toolName, success: true, output: `File ${filePath} written successfully.` };
        }

        case 'listFiles': {
          const subpath = String(args.subpath || args.path || '.');
          this.log('info', `[Tool:listFiles] Listing directory: ${subpath}`);
          const files = await this.sandbox.listFiles(subpath);
          return { toolName, success: true, output: files.join('\n'), data: files };
        }

        case 'runTest': {
          const cmd = String(args.command || 'npm');
          const testArgs = Array.isArray(args.args) ? args.args.map(String) : ['test'];
          this.log('info', `[Tool:runTest] Executing test command: ${cmd} ${testArgs.join(' ')}`);
          const res = await this.sandbox.runTest(cmd, testArgs);
          if (res.stdout) {
            res.stdout.split('\n').filter(l => l.trim().length > 0).forEach(l => {
              this.log('info', `[TestOutput] ${l}`);
            });
          }
          if (res.stderr) {
            res.stderr.split('\n').filter(l => l.trim().length > 0).forEach(l => {
              this.log('warn', `[TestStderr] ${l}`);
            });
          }
          const success = res.exitCode === 0;
          this.log(success ? 'success' : 'error', `[Tool:runTest] Test finished with Exit ${res.exitCode}`);
          return {
            toolName,
            success,
            output: `Exit Code: ${res.exitCode}\nSTDOUT:\n${res.stdout}\nSTDERR:\n${res.stderr}`,
            data: res
          };
        }

        case 'gitCommit': {
          const message = String(args.message || `task(${this.worktree.taskId}): update code`);
          this.log('info', `[Tool:gitCommit] Committing worktree changes: "${message}"`);
          const { execFile } = await import('child_process');
          const { promisify } = await import('util');
          const execAsync = promisify(execFile);
          await execAsync('git', ['add', '-A'], { cwd: this.worktree.worktreePath });
          try {
            const { stdout } = await execAsync('git', ['commit', '-m', message], { cwd: this.worktree.worktreePath });
            return { toolName, success: true, output: stdout };
          } catch (commitErr: unknown) {
            const msg = commitErr instanceof Error ? commitErr.message : String(commitErr);
            if (msg.includes('nothing to commit')) {
              return { toolName, success: true, output: 'Nothing to commit (working tree clean).' };
            }
            throw commitErr;
          }
        }

        case 'readDiff': {
          this.log('info', `[Tool:readDiff] Reading branch diff against base`);
          const { execFile } = await import('child_process');
          const { promisify } = await import('util');
          const execAsync = promisify(execFile);
          let diff = '';
          try {
            const { stdout } = await execAsync('git', ['diff', 'HEAD~1', 'HEAD'], { cwd: this.worktree.worktreePath });
            diff = stdout;
          } catch {
            const { stdout } = await execAsync('git', ['diff', 'main', 'HEAD'], { cwd: this.worktree.worktreePath });
            diff = stdout;
          }
          return { toolName, success: true, output: diff || 'No diff found (HEAD is up to date).' };
        }

        case 'scoreCriteria': {
          const criteria = Array.isArray(args.criteria) ? args.criteria : [];
          this.log('info', `[Tool:scoreCriteria] Scoring ${criteria.length} criteria items`);
          return { toolName, success: true, output: `Scored ${criteria.length} criteria items.`, data: criteria };
        }

        default:
          return { toolName, success: false, output: `Unknown tool: "${toolName}"` };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.log('error', `[Tool:${toolName}] Error: ${msg}`);
      return { toolName, success: false, output: `Tool execution failed: ${msg}` };
    }
  }
}
