import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execFileAsync = promisify(execFile);

export interface WorktreeContext {
  worktreePath: string;
  branchName: string;
  repoRoot: string;
  taskId: string;
  remove: () => Promise<void>;
}

export class WorktreeManager {
  private repoRoot: string;

  constructor(repoRoot?: string) {
    // Default repoRoot is parent of worker/ if running from worker/ or current directory
    this.repoRoot = repoRoot || path.resolve(process.cwd(), '..');
    // Ensure we are at git root
    if (this.repoRoot.endsWith('worker')) {
      this.repoRoot = path.resolve(this.repoRoot, '..');
    }
  }

  public getRepoRoot(): string {
    return this.repoRoot;
  }

  public async createWorktree(taskId: string, baseBranch = 'HEAD'): Promise<WorktreeContext> {
    const sanitizedId = taskId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const branchName = `task/${sanitizedId}`;
    const worktreesDir = path.join(this.repoRoot, '.worktrees');
    const worktreePath = path.join(worktreesDir, `task-${sanitizedId}`);

    await fs.mkdir(worktreesDir, { recursive: true });

    // Check if worktree directory already exists
    try {
      await fs.access(worktreePath);
      // Remove stale directory if present
      await this.removeWorktree(worktreePath);
    } catch {
      // Path does not exist, good to proceed
    }

    // Check if branch already exists
    let branchExists = false;
    try {
      await execFileAsync('git', ['rev-parse', '--verify', branchName], { cwd: this.repoRoot });
      branchExists = true;
    } catch {
      branchExists = false;
    }

    if (branchExists) {
      // Attach worktree to existing branch
      await execFileAsync('git', ['worktree', 'add', worktreePath, branchName], { cwd: this.repoRoot });
    } else {
      // Create new branch and worktree
      await execFileAsync('git', ['worktree', 'add', '-b', branchName, worktreePath, baseBranch], { cwd: this.repoRoot });
    }

    const remove = async () => {
      await this.removeWorktree(worktreePath);
    };

    return {
      worktreePath,
      branchName,
      repoRoot: this.repoRoot,
      taskId,
      remove
    };
  }

  public async removeWorktree(worktreePath: string): Promise<void> {
    try {
      await execFileAsync('git', ['worktree', 'remove', '--force', worktreePath], { cwd: this.repoRoot });
    } catch {
      // Fallback manual rimraf if git command fails
      try {
        await fs.rm(worktreePath, { recursive: true, force: true });
      } catch {
        // Ignored
      }
    }
    // Prune worktree database
    try {
      await execFileAsync('git', ['worktree', 'prune'], { cwd: this.repoRoot });
    } catch {
      // Ignored
    }
  }

  public async commitWorktree(worktreePath: string, message: string): Promise<string> {
    await execFileAsync('git', ['add', '-A'], { cwd: worktreePath });
    try {
      const { stdout } = await execFileAsync('git', ['commit', '-m', message], { cwd: worktreePath });
      const match = stdout.match(/\[[^\s]+\s([a-f0-9]+)\]/);
      return match ? match[1] : 'committed';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('nothing to commit')) {
        return 'no_changes';
      }
      throw err;
    }
  }

  public async getWorktreeDiff(worktreePath: string, baseRef = 'HEAD~1'): Promise<string> {
    try {
      const { stdout } = await execFileAsync('git', ['diff', baseRef, 'HEAD'], { cwd: worktreePath });
      return stdout;
    } catch {
      // If single commit or diff fails, fallback to git show
      try {
        const { stdout } = await execFileAsync('git', ['show', 'HEAD', '--stat', '-p'], { cwd: worktreePath });
        return stdout;
      } catch {
        return '';
      }
    }
  }

  public async mergeBranchToMain(branchName: string, message: string): Promise<{ success: boolean; output: string }> {
    try {
      // Fetch or checkout main
      await execFileAsync('git', ['merge', '--no-ff', '-m', message, branchName], { cwd: this.repoRoot });
      return { success: true, output: `Branch ${branchName} successfully merged.` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, output: `Git merge failed: ${msg}` };
    }
  }
}

export const defaultWorktreeManager = new WorktreeManager();
