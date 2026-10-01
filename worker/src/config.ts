import dotenv from 'dotenv';
import os from 'os';

// Load environment variables from .env if present
dotenv.config();

export interface WorkerConfig {
  supabaseUrl: string;
  supabaseKey: string;
  workerId: string;
  workerHost: string;
  capabilities: string[];
  pollIntervalMs: number;
  leaseDurationSeconds: number;
  heartbeatIntervalSeconds: number;
  logBatchIntervalMs: number;
  maxConcurrentTasks: number;
  isMockMode: boolean;
}

export function loadConfig(): WorkerConfig {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

  const isMockMode = !supabaseUrl || !supabaseKey;

  const defaultWorkerId = `worker-${os.hostname().replace(/[^a-zA-Z0-9-]/g, '') || 'local'}-${process.pid}`;
  const workerId = process.env.WORKER_ID || defaultWorkerId;
  const workerHost = os.hostname();

  const capabilitiesRaw = process.env.WORKER_CAPABILITIES || 'shell,echo,file_generator';
  const capabilities = capabilitiesRaw.split(',').map(c => c.trim()).filter(Boolean);

  const pollIntervalMs = Math.max(500, parseInt(process.env.POLL_INTERVAL_MS || '3000', 10));
  const leaseDurationSeconds = Math.max(30, parseInt(process.env.LEASE_DURATION_SECONDS || '300', 10));
  const heartbeatIntervalSeconds = Math.max(5, parseInt(process.env.HEARTBEAT_INTERVAL_SECONDS || '30', 10));
  const logBatchIntervalMs = Math.max(200, parseInt(process.env.LOG_BATCH_INTERVAL_MS || '1500', 10));
  const maxConcurrentTasks = Math.max(1, parseInt(process.env.MAX_CONCURRENT_TASKS || '1', 10));

  return {
    supabaseUrl,
    supabaseKey,
    workerId,
    workerHost,
    capabilities,
    pollIntervalMs,
    leaseDurationSeconds,
    heartbeatIntervalSeconds,
    logBatchIntervalMs,
    maxConcurrentTasks,
    isMockMode
  };
}
