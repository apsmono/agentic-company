-- ============================================================================
-- Migration: 20261001_claim_task_rpc.sql
-- Function: claim_next_task (Atomic Task Claiming with FOR UPDATE SKIP LOCKED)
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

-- Grant execution permission to public/anon role
GRANT EXECUTE ON FUNCTION claim_next_task(TEXT, INTERVAL) TO anon, authenticated, service_role;
