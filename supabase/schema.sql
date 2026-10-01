-- ============================================================================
-- Agentic Company • PostgreSQL Core Schema (Supabase)
-- Version: v1.4.0
-- Architecture: Build Plan §5 (Single Source of Truth)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. Directives (Chairman Strategic Instructions to CEO Agent)
-- ============================================================================
CREATE TABLE IF NOT EXISTS directives (
    id TEXT PRIMARY KEY,                       -- e.g. 'DIR-1'
    text TEXT NOT NULL,                        -- Directive mandate / description
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('draft', 'in_progress', 'review_ready', 'completed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'high' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    budget_allocated TEXT DEFAULT '$5.00',
    tokens_used INTEGER DEFAULT 0,
    cost_usd NUMERIC(10, 4) DEFAULT 0.0000,
    report TEXT,                               -- Final CEO executive briefing memo
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. Tasks (Units of Work & Queue Items)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,                       -- e.g. 'TASK-101'
    directive_id TEXT REFERENCES directives(id) ON DELETE SET NULL,
    parent_task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    type TEXT DEFAULT 'general',
    title TEXT NOT NULL,
    description TEXT,
    owner_agent TEXT NOT NULL,                 -- e.g. 'ceo', 'cto', 'dev-1', 'dev-2', 'reviewer'
    worker TEXT DEFAULT 'CTO Agent',
    payload JSONB DEFAULT '{}'::jsonb,
    acceptance_criteria TEXT[] DEFAULT '{}',
    door TEXT NOT NULL DEFAULT 'two_way' CHECK (door IN ('one_way', 'two_way')),
    status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'running', 'approval_pending', 'review', 'done', 'failed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    tokens_used INTEGER DEFAULT 0,
    cost_usd NUMERIC(10, 4) DEFAULT 0.0000,
    lease_until TIMESTAMPTZ DEFAULT NOW(),     -- For FOR UPDATE SKIP LOCKED leasing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. Runs (One Row Per Execution Attempt)
-- ============================================================================
CREATE TABLE IF NOT EXISTS runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration TEXT,
    exit_code INTEGER,
    tokens_used INTEGER DEFAULT 0,
    cost_usd NUMERIC(10, 4) DEFAULT 0.0000,
    summary TEXT,
    result JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- 4. Run Logs (Live Console Stream to Dashboard)
-- ============================================================================
CREATE TABLE IF NOT EXISTS run_logs (
    id BIGSERIAL PRIMARY KEY,
    run_id UUID REFERENCES runs(id) ON DELETE CASCADE,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ DEFAULT NOW(),
    level TEXT DEFAULT 'info' CHECK (level IN ('info', 'warn', 'error', 'success', 'system')),
    message TEXT NOT NULL
);

-- ============================================================================
-- 5. Artifacts (Outputs: Files, PRs, Generated Data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES runs(id) ON DELETE CASCADE,
    task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,                        -- 'pr', 'file', 'report', 'parquet', 'json'
    url_or_path TEXT NOT NULL,
    label TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. Agents (Employee Roles, Budgets & Tool Whitelists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,                       -- 'ceo', 'cto', 'dev-1', 'dev-2', 'reviewer'
    role TEXT NOT NULL,
    reports_to TEXT NOT NULL,
    system_prompt TEXT,
    allowed_tools TEXT[] NOT NULL DEFAULT '{}',
    task_types TEXT[] DEFAULT '{}',
    budget NUMERIC(10, 2) DEFAULT 10.00,       -- Daily budget cap in USD
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. Approvals (One-Way Door Action Ledger)
-- ============================================================================
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    requested_by TEXT NOT NULL,                -- Agent ID
    action TEXT NOT NULL,                      -- Action description, e.g. 'Merge PR to main'
    decision TEXT NOT NULL DEFAULT 'pending' CHECK (decision IN ('pending', 'approved', 'rejected', 'revision_requested')),
    decided_at TIMESTAMPTZ,
    note TEXT,                                 -- Chairman guidance notes
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. Decisions (Corporate Architectural & Executive Decision Log)
-- ============================================================================
CREATE TABLE IF NOT EXISTS decisions (
    id TEXT PRIMARY KEY,                       -- e.g. 'ADR-001'
    date TIMESTAMPTZ DEFAULT NOW(),
    decided_by TEXT NOT NULL,                  -- 'Chairman', 'CEO', 'CTO'
    decision TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. Workers (Running Background Daemons & Heartbeats)
-- ============================================================================
CREATE TABLE IF NOT EXISTS workers (
    id TEXT PRIMARY KEY,                       -- e.g. 'mac-mini-worker-01'
    host TEXT NOT NULL,
    capabilities JSONB DEFAULT '{}'::jsonb,
    last_heartbeat TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes for High-Concurrency Performance & Realtime Listeners
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_tasks_queue ON tasks(status, priority, lease_until);
CREATE INDEX IF NOT EXISTS idx_tasks_directive ON tasks(directive_id);
CREATE INDEX IF NOT EXISTS idx_runs_task ON runs(task_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_run_logs_task ON run_logs(task_id, ts ASC);
CREATE INDEX IF NOT EXISTS idx_run_logs_run ON run_logs(run_id, ts ASC);
CREATE INDEX IF NOT EXISTS idx_approvals_task ON approvals(task_id, decision);

-- ============================================================================
-- Auto-update updated_at triggers
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON tasks;
CREATE TRIGGER trg_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_directives_updated_at ON directives;
CREATE TRIGGER trg_directives_updated_at
    BEFORE UPDATE ON directives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================
ALTER TABLE directives ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Allow anon and authenticated roles full read access
CREATE POLICY "Allow public read access to directives" ON directives FOR SELECT USING (true);
CREATE POLICY "Allow public read access to tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Allow public read access to runs" ON runs FOR SELECT USING (true);
CREATE POLICY "Allow public read access to run_logs" ON run_logs FOR SELECT USING (true);
CREATE POLICY "Allow public read access to artifacts" ON artifacts FOR SELECT USING (true);
CREATE POLICY "Allow public read access to agents" ON agents FOR SELECT USING (true);
CREATE POLICY "Allow public read access to approvals" ON approvals FOR SELECT USING (true);
CREATE POLICY "Allow public read access to decisions" ON decisions FOR SELECT USING (true);
CREATE POLICY "Allow public read access to workers" ON workers FOR SELECT USING (true);

-- Allow dashboard write access (controlled via Chairman PIN in the UI)
CREATE POLICY "Allow anon insert tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update tasks" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete tasks" ON tasks FOR DELETE USING (true);

CREATE POLICY "Allow anon insert directives" ON directives FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update directives" ON directives FOR UPDATE USING (true);

CREATE POLICY "Allow anon insert approvals" ON approvals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update approvals" ON approvals FOR UPDATE USING (true);

CREATE POLICY "Allow anon insert runs" ON runs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update runs" ON runs FOR UPDATE USING (true);
CREATE POLICY "Allow anon insert run_logs" ON run_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert artifacts" ON artifacts FOR INSERT WITH CHECK (true);

-- ============================================================================
-- Seed Initial Agent Personas
-- ============================================================================
INSERT INTO agents (id, role, reports_to, system_prompt, allowed_tools, budget, enabled)
VALUES
    ('ceo', 'CEO Agent', 'Chairman', 'You are the CEO of an autonomous AI company. Plan, direct, and oversee technical progress.', ARRAY['plan_initiative', 'delegate_task', 'audit_financials', 'compile_board_memo'], 15.00, true),
    ('cto', 'CTO Agent', 'CEO', 'You are the CTO. Own technical architecture, task specifications, and engineering standards.', ARRAY['spec_task', 'review_architecture', 'manage_worktree', 'git_merge'], 15.00, true),
    ('dev-1', 'Dev Worker 01', 'CTO', 'You are a Senior Backend Developer. Implement services and write unit tests.', ARRAY['read_code', 'write_code', 'run_unit_tests', 'git_commit'], 10.00, true),
    ('dev-2', 'Dev Worker 02', 'CTO', 'You are a Frontend Developer. Maintain the Cockpit UI, design tokens, and components.', ARRAY['edit_html', 'edit_css', 'inspect_dom', 'test_views'], 10.00, true),
    ('reviewer', 'Reviewer Agent', 'CTO', 'You are the Security & Code Reviewer. Audit diffs against criteria before one-way gates.', ARRAY['audit_diff', 'check_acceptance_criteria', 'flag_one_way_door'], 5.00, true)
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Decision Record
INSERT INTO decisions (id, decided_by, decision, reason)
VALUES
    ('ADR-001', 'Chairman', 'Adopted PostgreSQL FOR UPDATE SKIP LOCKED as the task queue', 'Avoids Redis operational overhead; safe concurrent multi-worker leasing natively in Postgres.')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- RPC: Atomic Task Claiming with FOR UPDATE SKIP LOCKED
-- ============================================================================
CREATE OR REPLACE FUNCTION claim_next_task(
    p_worker_id TEXT,
    p_lease_duration INTERVAL DEFAULT INTERVAL '5 minutes'
)
RETURNS SETOF tasks
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_task tasks;
BEGIN
    -- Atomically lock the highest priority queued or expired-lease task
    SELECT * INTO v_task
    FROM tasks
    WHERE (status = 'queued' OR (status = 'running' AND lease_until < NOW()))
      AND attempts < max_attempts
    ORDER BY priority DESC, created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF v_task.id IS NOT NULL THEN
        UPDATE tasks
        SET status = 'running',
            lease_until = NOW() + p_lease_duration,
            attempts = attempts + 1,
            updated_at = NOW()
        WHERE id = v_task.id;

        RETURN QUERY SELECT * FROM tasks WHERE id = v_task.id;
    END IF;
    RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION claim_next_task(TEXT, INTERVAL) TO anon, authenticated, service_role;
