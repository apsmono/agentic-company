import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { WorkerConfig } from './config.js';
import { Task, Run, RunLog, Artifact, WorkerInfo, Approval, TaskStatus, Directive, Decision } from './types.js';
import { LogBatchWriter } from './logger.js';

export interface DatabaseService extends LogBatchWriter {
  isMock(): boolean;
  claimNextTask(workerId: string, leaseDurationSeconds: number): Promise<Task | null>;
  renewTaskLease(taskId: string, leaseDurationSeconds: number): Promise<boolean>;
  releaseTaskLease(taskId: string): Promise<boolean>;
  updateTaskStatus(taskId: string, status: TaskStatus, patch?: Partial<Task>): Promise<boolean>;
  createTask(task: Task): Promise<boolean>;
  createRun(taskId: string, agentId?: string | null): Promise<Run>;
  finishRun(runId: string, data: {
    exitCode: number;
    summary: string;
    result?: Record<string, unknown> | null;
    tokensUsed?: number;
    costUsd?: number;
  }): Promise<boolean>;
  insertRunLogs(logs: RunLog[]): Promise<void>;
  insertArtifacts(artifacts: Artifact[]): Promise<void>;
  updateWorkerHeartbeat(info: WorkerInfo): Promise<void>;
  createApproval(approval: Approval): Promise<void>;
  createDecision(decision: Decision): Promise<void>;
  getTodaySpend(): Promise<number>;
  getRecentRuns(limit?: number): Promise<Run[]>;
  getDirective(id: string): Promise<Directive | null>;
  updateDirective(id: string, patch: Partial<Directive>): Promise<boolean>;
}

export class SupabaseDatabaseService implements DatabaseService {
  private client: SupabaseClient;

  constructor(private config: WorkerConfig) {
    this.client = createClient(config.supabaseUrl, config.supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }

  public isMock(): boolean {
    return false;
  }

  public async claimNextTask(workerId: string, leaseDurationSeconds: number): Promise<Task | null> {
    try {
      // 1. Try atomic stored procedure
      const { data, error } = await this.client.rpc('claim_next_task', {
        p_worker_id: workerId,
        p_lease_duration: `${leaseDurationSeconds} seconds`
      });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data[0] as Task;
      }
    } catch {
      // RPC may not exist; proceed to fallback query
    }

    // 2. Fallback query for environments where RPC is pending
    const nowIso = new Date().toISOString();
    const { data: candidates, error: selectErr } = await this.client
      .from('tasks')
      .select('*')
      .or(`status.eq.queued,and(status.eq.running,lease_until.lt.${nowIso})`)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1);

    if (selectErr || !candidates || candidates.length === 0) {
      return null;
    }

    const candidate = candidates[0] as Task;
    if (candidate.attempts >= candidate.max_attempts) {
      // Poisonous task; transition to failed
      await this.updateTaskStatus(candidate.id, 'failed');
      return null;
    }

    const leaseUntilIso = new Date(Date.now() + leaseDurationSeconds * 1000).toISOString();
    const { data: updated, error: updateErr } = await this.client
      .from('tasks')
      .update({
        status: 'running',
        lease_until: leaseUntilIso,
        attempts: (candidate.attempts || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', candidate.id)
      .select();

    if (updateErr || !updated || updated.length === 0) {
      return null; // Another worker claimed it first
    }

    return updated[0] as Task;
  }

  public async renewTaskLease(taskId: string, leaseDurationSeconds: number): Promise<boolean> {
    const leaseUntilIso = new Date(Date.now() + leaseDurationSeconds * 1000).toISOString();
    const { error } = await this.client
      .from('tasks')
      .update({
        lease_until: leaseUntilIso,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('status', 'running');

    return !error;
  }

  public async releaseTaskLease(taskId: string): Promise<boolean> {
    const { error } = await this.client
      .from('tasks')
      .update({
        lease_until: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('status', 'running');

    return !error;
  }

  public async updateTaskStatus(taskId: string, status: TaskStatus, patch: Partial<Task> = {}): Promise<boolean> {
    const { error } = await this.client
      .from('tasks')
      .update({
        status,
        ...patch,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    return !error;
  }

  public async createRun(taskId: string, agentId?: string | null): Promise<Run> {
    const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newRun: Run = {
      id: runId,
      task_id: taskId,
      agent_id: agentId || null,
      started_at: new Date().toISOString(),
      tokens_used: 0,
      cost_usd: 0
    };

    const { error } = await this.client
      .from('runs')
      .insert(newRun);

    if (error) {
      console.warn(`[SupabaseDB] Failed to insert run row ${runId}:`, error.message);
    }
    return newRun;
  }

  public async finishRun(runId: string, data: {
    exitCode: number;
    summary: string;
    result?: Record<string, unknown> | null;
    tokensUsed?: number;
    costUsd?: number;
  }): Promise<boolean> {
    const { error } = await this.client
      .from('runs')
      .update({
        ended_at: new Date().toISOString(),
        exit_code: data.exitCode,
        summary: data.summary,
        result: data.result || null,
        tokens_used: data.tokensUsed || 0,
        cost_usd: data.costUsd || 0
      })
      .eq('id', runId);

    return !error;
  }

  public async insertRunLogs(logs: RunLog[]): Promise<void> {
    if (logs.length === 0) return;
    const { error } = await this.client
      .from('run_logs')
      .insert(logs);

    if (error) {
      throw error;
    }
  }

  public async insertArtifacts(artifacts: Artifact[]): Promise<void> {
    if (artifacts.length === 0) return;
    const { error } = await this.client
      .from('artifacts')
      .insert(artifacts);

    if (error) {
      console.error('[SupabaseDB] Failed to insert artifacts:', error.message);
    }
  }

  public async updateWorkerHeartbeat(info: WorkerInfo): Promise<void> {
    const { error } = await this.client
      .from('workers')
      .upsert({
        id: info.id,
        host: info.host,
        capabilities: info.capabilities,
        last_heartbeat: new Date().toISOString(),
        status: info.status,
        metadata: info.metadata || {}
      });

    if (error) {
      console.warn('[SupabaseDB] Heartbeat upsert failed:', error.message);
    }
  }

  public async createTask(task: Task): Promise<boolean> {
    const { error } = await this.client
      .from('tasks')
      .insert(task);
    return !error;
  }

  public async createDecision(decision: Decision): Promise<void> {
    const { error } = await this.client
      .from('decisions')
      .insert(decision);
    if (error) {
      console.error('[SupabaseDB] Failed to insert decision:', error.message);
    }
  }

  public async createApproval(approval: Approval): Promise<void> {
    const { error } = await this.client
      .from('approvals')
      .insert(approval);
    if (error) {
      console.error('[SupabaseDB] Failed to insert approval:', error.message);
    }
  }

  public async getTodaySpend(): Promise<number> {
    const midnight = new Date();
    midnight.setUTCHours(0, 0, 0, 0);
    const { data, error } = await this.client
      .from('runs')
      .select('cost_usd')
      .gte('started_at', midnight.toISOString());

    if (error || !data) return 0;
    return data.reduce((acc, row) => acc + (Number(row.cost_usd) || 0), 0);
  }

  public async getRecentRuns(limit = 20): Promise<Run[]> {
    const { data } = await this.client
      .from('runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    return (data || []) as Run[];
  }

  public async getDirective(id: string): Promise<Directive | null> {
    const { data } = await this.client
      .from('directives')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    return (data as Directive) || null;
  }

  public async updateDirective(id: string, patch: Partial<Directive>): Promise<boolean> {
    const { error } = await this.client
      .from('directives')
      .update(patch)
      .eq('id', id);

    return !error;
  }
}

/**
 * In-memory Database Service for local simulation, offline testing, and CI verification
 */
export class MockDatabaseService implements DatabaseService {
  private tasks: Map<string, Task> = new Map();
  private runs: Map<string, Run> = new Map();
  private logs: RunLog[] = [];
  private artifacts: Artifact[] = [];
  private workers: Map<string, WorkerInfo> = new Map();
  private approvals: Approval[] = [];
  private directives: Map<string, Directive> = new Map();
  private decisions: Map<string, Decision> = new Map();

  constructor(seed: boolean = true) {
    if (seed) {
      this.seedDefaultTasks();
    }
  }

  public clear(): void {
    this.tasks.clear();
    this.runs.clear();
    this.logs = [];
    this.artifacts = [];
    this.workers.clear();
    this.approvals = [];
    this.directives.clear();
    this.decisions.clear();
  }

  public isMock(): boolean {
    return true;
  }

  public seedDefaultTasks(): void {
    const sampleTask: Task = {
      id: 'task_mock_001',
      type: 'echo',
      payload: { message: 'Hello from Agentic Company Worker Mock Runtime!' },
      door: 'two_way',
      status: 'queued',
      priority: 'high',
      attempts: 0,
      max_attempts: 3,
      lease_until: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.tasks.set(sampleTask.id, sampleTask);
  }

  public addTask(task: Task): void {
    this.tasks.set(task.id, task);
  }

  public async claimNextTask(workerId: string, leaseDurationSeconds: number): Promise<Task | null> {
    const now = Date.now();
    const priorityWeights: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };

    const candidates = Array.from(this.tasks.values()).filter(task => {
      const leaseExpired = !task.lease_until || new Date(task.lease_until).getTime() <= now;
      return (task.status === 'queued' || (task.status === 'running' && leaseExpired)) && task.attempts < task.max_attempts;
    });

    candidates.sort((a, b) => {
      const pDiff = (priorityWeights[b.priority] || 1) - (priorityWeights[a.priority] || 1);
      if (pDiff !== 0) return pDiff;
      const tA = new Date(a.created_at || 0).getTime();
      const tB = new Date(b.created_at || 0).getTime();
      return tA - tB;
    });

    if (candidates.length === 0) return null;

    const task = candidates[0];
    task.status = 'running';
    task.attempts += 1;
    task.lease_until = new Date(now + leaseDurationSeconds * 1000).toISOString();
    task.updated_at = new Date().toISOString();
    return { ...task };
  }

  public async renewTaskLease(taskId: string, leaseDurationSeconds: number): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== 'running') return false;
    task.lease_until = new Date(Date.now() + leaseDurationSeconds * 1000).toISOString();
    task.updated_at = new Date().toISOString();
    return true;
  }

  public async releaseTaskLease(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    task.lease_until = new Date().toISOString();
    return true;
  }

  public async updateTaskStatus(taskId: string, status: TaskStatus, patch: Partial<Task> = {}): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    Object.assign(task, patch, { status, updated_at: new Date().toISOString() });
    return true;
  }

  public async createRun(taskId: string, agentId?: string | null): Promise<Run> {
    const run: Run = {
      id: `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      task_id: taskId,
      agent_id: agentId || null,
      started_at: new Date().toISOString()
    };
    this.runs.set(run.id, run);
    return run;
  }

  public async finishRun(runId: string, data: {
    exitCode: number;
    summary: string;
    result?: Record<string, unknown> | null;
    tokensUsed?: number;
    costUsd?: number;
  }): Promise<boolean> {
    const run = this.runs.get(runId);
    if (!run) return false;
    Object.assign(run, {
      ended_at: new Date().toISOString(),
      exit_code: data.exitCode,
      summary: data.summary,
      result: data.result || null,
      tokens_used: data.tokensUsed || 0,
      cost_usd: data.costUsd || 0
    });
    return true;
  }

  public async insertRunLogs(logs: RunLog[]): Promise<void> {
    this.logs.push(...logs);
  }

  public async insertArtifacts(artifacts: Artifact[]): Promise<void> {
    this.artifacts.push(...artifacts);
  }

  public async updateWorkerHeartbeat(info: WorkerInfo): Promise<void> {
    this.workers.set(info.id, { ...info, last_heartbeat: new Date().toISOString() });
  }

  public async createApproval(approval: Approval): Promise<void> {
    this.approvals.push(approval);
  }

  public async createTask(task: Task): Promise<boolean> {
    this.tasks.set(task.id, task);
    return true;
  }

  public async createDecision(decision: Decision): Promise<void> {
    this.decisions.set(decision.id, decision);
  }

  public async getTodaySpend(): Promise<number> {
    let sum = 0;
    for (const run of this.runs.values()) {
      sum += run.cost_usd || 0;
    }
    return sum;
  }

  public async getRecentRuns(limit = 20): Promise<Run[]> {
    return Array.from(this.runs.values()).slice(-limit);
  }

  public async getDirective(id: string): Promise<Directive | null> {
    return this.directives.get(id) || null;
  }

  public async updateDirective(id: string, patch: Partial<Directive>): Promise<boolean> {
    const d = this.directives.get(id);
    if (!d) return false;
    Object.assign(d, patch);
    return true;
  }

  public addDirective(d: Directive): void {
    this.directives.set(d.id, d);
  }

  public getDecisions(): Decision[] {
    return Array.from(this.decisions.values());
  }

  public getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  public getRun(id: string): Run | undefined {
    return this.runs.get(id);
  }

  public getLogs(runId: string): RunLog[] {
    return this.logs.filter(l => l.run_id === runId);
  }

  public getArtifacts(runId: string): Artifact[] {
    return this.artifacts.filter(a => a.run_id === runId);
  }
}

export function createDatabaseService(config: WorkerConfig): DatabaseService {
  if (config.isMockMode) {
    console.log('\x1b[33m[WorkerInit] SUPABASE_URL or SUPABASE_KEY missing. Initializing in Mock/Offline Mode.\x1b[0m');
    return new MockDatabaseService();
  }
  return new SupabaseDatabaseService(config);
}
