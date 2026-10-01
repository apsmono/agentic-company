/**
 * Type definitions for Agentic Company Worker Daemon
 * Based on Supabase Schema and Master Build Plan §5
 */

export type TaskStatus = 
  | 'queued' 
  | 'running' 
  | 'approval_pending' 
  | 'verifying' 
  | 'completed' 
  | 'failed';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type DoorType = 'one_way' | 'two_way';

export interface TaskPayload {
  command?: string;
  args?: string[];
  cwd?: string;
  timeout_seconds?: number;
  message?: string;
  output_filename?: string;
  output_content?: string;
  file_kind?: 'file' | 'report' | 'diff' | 'url';
  artifact_label?: string;
  agent_prompt?: string;
  allowed_tools?: string[];
  requires_approval?: boolean;
  approval_action?: string;
  [key: string]: unknown;
}

export interface Task {
  id: string;
  directive_id?: string | null;
  parent_task_id?: string | null;
  type: string;
  owner_agent?: string | null;
  payload: TaskPayload;
  acceptance_criteria?: string[] | null;
  door: DoorType;
  status: TaskStatus;
  priority: TaskPriority;
  attempts: number;
  max_attempts: number;
  lease_until?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Run {
  id: string;
  task_id: string;
  agent_id?: string | null;
  started_at: string;
  ended_at?: string | null;
  exit_code?: number | null;
  tokens_used?: number;
  cost_usd?: number;
  summary?: string | null;
  result?: Record<string, unknown> | null;
  created_at?: string;
}

export type LogLevel = 'info' | 'warn' | 'error' | 'success';

export interface RunLog {
  id?: number;
  run_id: string;
  ts?: string;
  level: LogLevel;
  message: string;
}

export interface Artifact {
  id?: string;
  run_id: string;
  kind: 'file' | 'pr' | 'report' | 'diff' | 'url';
  url_or_path: string;
  label?: string | null;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface WorkerInfo {
  id: string;
  host: string;
  capabilities: string[];
  last_heartbeat: string;
  status: 'active' | 'draining' | 'stopped';
  metadata?: Record<string, unknown>;
}

export interface Approval {
  id?: string;
  task_id: string;
  requested_by?: string;
  action: string;
  door: DoorType;
  decision: 'pending' | 'approved' | 'rejected';
  decided_at?: string | null;
  note?: string | null;
  created_at?: string;
}

export interface Directive {
  id: string;
  text: string;
  status: 'inbox' | 'in_progress' | 'completed' | 'cancelled';
  budget_limit?: number;
  target_date?: string | null;
  report?: string | null;
  created_at?: string;
}

export interface Decision {
  id: string;
  date?: string;
  decided_by: string;
  decision: string;
  reason: string;
  created_at?: string;
}

export interface TaskHandlerResult {
  exitCode: number;
  summary: string;
  result?: Record<string, unknown>;
  artifacts?: Omit<Artifact, 'run_id'>[];
  tokensUsed?: number;
  costUsd?: number;
  requestApproval?: {
    action: string;
    note?: string;
  };
}

export interface TaskExecutionContext {
  task: Task;
  run: Run;
  workerId: string;
  log: (level: LogLevel, message: string) => void;
  isCancelled: () => boolean;
}

export type TaskHandler = (ctx: TaskExecutionContext) => Promise<TaskHandlerResult>;
