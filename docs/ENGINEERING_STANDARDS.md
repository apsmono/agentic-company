# Engineering Standards — Agentic Company

> **Owner**: CTO Agent  
> **Status**: Approved Standard (v1.0)  
> **Enforcement**: Mandatory for all Dev Workers and Reviewers.

---

## 1. Technical Stack & Conventions

1. **TypeScript First**:
   - All backend, worker, and agent runtime code must be written in **TypeScript** (`strict: true`).
   - Disallowed: `any`, loose typing, implicit returns.
   - Every database table row must map to an explicit TypeScript interface in `src/types.ts`.

2. **Frontend UI Guidelines**:
   - The Cockpit dashboard follows vanilla HTML5, CSS3, and modern JavaScript (ES2022+).
   - No external frontend frameworks (React, Vue) without explicit Chairman approval.
   - All user- or agent-supplied text rendered into HTML **must** be sanitized with `escapeHtml()` or set via `textContent`.
   - Modals and drawers must be fully accessible and testable via unique DOM IDs.

3. **Database & Storage Abstraction**:
   - The UI never queries the database directly; all access is routed through `StorageAdapter`.
   - The worker runtime and dashboard interact exclusively through Supabase tables.

---

## 2. Git & Worktree Workflow

1. **Dedicated Worktree Branches**:
   - Every task executes in its own isolated worktree (`.worktrees/task-{taskId}`).
   - Work is committed to a task-specific branch: `task/{taskId}`.
2. **Conventional Commit Messages**:
   - Format: `type(scope): concise summary [task_id]`
   - Types: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`.
   - Example: `feat(worker): implement isolated worktree manager [task_123]`
3. **No Direct Commits to `main`**:
   - Merging into `main` is strictly reserved for the One-Way Door Merge Hook following Reviewer audit and Chairman PIN approval.

---

## 3. Testing & Verification

1. **Automated Verification**:
   - Every PR or task output must include executable tests (`npm test` or specific script).
   - An agent cannot complete a coding task unless all unit and integration tests pass with **Exit 0**.
2. **Reviewer Audit Rubric**:
   - The Reviewer agent must score the diff against:
     - [ ] Acceptance criteria full compliance
     - [ ] Zero lint / TypeScript compilation errors
     - [ ] Unit tests present and passing
     - [ ] No hardcoded secrets, passwords, or `.env` references
     - [ ] Clean and minimal diff without extraneous changes
