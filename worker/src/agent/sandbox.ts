import path from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';

export class SecurityViolationError extends Error {
  constructor(message: string) {
    super(`[SecuritySandboxViolation] ${message}`);
    this.name = 'SecurityViolationError';
  }
}

export class AgentSandbox {
  constructor(private worktreePath: string) {}

  public getWorktreePath(): string {
    return this.worktreePath;
  }

  /**
   * Safely resolves a relative path within the worktree jail.
   * Throws SecurityViolationError on directory traversal or .env access.
   */
  public safeResolve(relativeSubpath: string): string {
    const normalized = path.normalize(relativeSubpath);
    const resolved = path.resolve(this.worktreePath, normalized);

    // 1. Jail check: must remain inside worktreePath
    const rel = path.relative(this.worktreePath, resolved);
    if (rel.startsWith('..') || path.isAbsolute(normalized)) {
      throw new SecurityViolationError(`Access denied: Path "${relativeSubpath}" escapes the isolated worktree boundary.`);
    }

    // 2. Secret check: never access .env files
    const basename = path.basename(resolved);
    if (basename === '.env' || basename.startsWith('.env.')) {
      throw new SecurityViolationError(`Access denied: Direct access to secret environment files (${basename}) is strictly prohibited.`);
    }

    // 3. Git metadata protection
    if (rel.startsWith('.git') && !rel.startsWith('.gitignore')) {
      throw new SecurityViolationError(`Access denied: Direct manipulation of .git internals is prohibited.`);
    }

    return resolved;
  }

  public async readFile(subpath: string): Promise<string> {
    const target = this.safeResolve(subpath);
    return await fs.readFile(target, 'utf-8');
  }

  public async writeFile(subpath: string, content: string): Promise<void> {
    const target = this.safeResolve(subpath);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content, 'utf-8');
  }

  public async listFiles(subpath = '.'): Promise<string[]> {
    const target = this.safeResolve(subpath);
    const entries = await fs.readdir(target, { withFileTypes: true });
    return entries.map(e => e.isDirectory() ? `${e.name}/` : e.name);
  }

  public async runTest(testCmd: string, testArgs: string[] = []): Promise<{ exitCode: number; stdout: string; stderr: string }> {
    return new Promise((resolve) => {
      const child = spawn(testCmd, testArgs, {
        cwd: this.worktreePath,
        shell: false,
        env: { ...process.env, NODE_ENV: 'test', CI: 'true' }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (d) => { stdout += d.toString(); });
      child.stderr.on('data', (d) => { stderr += d.toString(); });

      child.on('error', (err) => {
        resolve({ exitCode: 127, stdout, stderr: err.message });
      });

      child.on('close', (code) => {
        resolve({ exitCode: code ?? 0, stdout, stderr });
      });
    });
  }
}
