# AGENTS.md — Agentic Company

Shared instructions for every AI coding agent working in this repo (Claude Code, Antigravity, Gemini CLI, Codex, Cursor).
`CLAUDE.md` and `GEMINI.md` import this file and add only tool-specific notes. **Edit this file, not the copies.**

## What this project is

An autonomous "AI company". The human **Chairman** gives directives and approves irreversible actions. A **CEO agent** plans, a **CTO agent** splits work into tasks, and **dev workers** plus a **reviewer** build the company's own code.
The first product is the company itself: the dashboard, the task queue and the worker runtime.

Read before any non-trivial change:
- `docs/AGENTIC_COMPANY_BUILD_PLAN.md`: vision, org, governance rules, stack, data model, 7-step plan
- `docs/INCREMENTAL_ROADMAP.md`: versioned rollout (v1.3 → v2.2). **This is the build order to follow.**
- `docs/PLAN_CRITIQUE.md`: risks and the remedies we adopted
- `docs/ORGANIZATIONAL_STRUCTURE_AND_GOVERNANCE.md`: background reference only

## Current state (v1.2 "WorkerFlow")

- Front end only: **vanilla HTML/CSS/JS, no build step, no dependencies** (Google Fonts only).
- `index.html` is the UI shell (header, Kanban columns, table view, drawer, modals). `styles.css` is the dark, glassmorphic design system. `app.js` holds all logic.
- `app.js` layout: `DEFAULT_TASKS` demo data → `TaskManager` class (state, filters, metrics; persisted to `localStorage` under `workerflow_tasks_v1`) → `render*` functions → drawer and modals → simulator (`simulateWorkerRun`, `simulateRunAllQueued`) → drag and drop → `setupEventListeners()`.
- Workers are **simulated**. There is no backend yet.

Run it: `python3 -m http.server 4321`, then open http://localhost:4321 (or just open `index.html`).

## Target stack (do not substitute without Chairman approval)

| Layer | Choice |
|---|---|
| Language | TypeScript everywhere (UI, worker, agents) |
| DB, realtime, storage | Supabase (Postgres), the single source of truth |
| Queue | Postgres `FOR UPDATE SKIP LOCKED` (pg-boss only if needed). No Redis. |
| Agents | Claude Agent SDK, one session per task |
| Worker process | Node/TS daemon under `pm2` on a Mac mini |
| Code hosting | GitHub, one repo, PRs |
| Notifications | Telegram bot |
| Dashboard hosting | Static (GitHub Pages / Vercel / Firebase Hosting) + Supabase RLS + Chairman PIN gate |

**Open decision:** whether the dashboard stays vanilla JS or moves to React + TypeScript (Vite). Until the Chairman decides, keep it vanilla JS and **do not start a framework migration.**

## Target layout (Build Plan, Step 0)

```
agentic-company/
├── dashboard/   # Chairman cockpit UI (today's index.html, styles.css, app.js move here)
├── worker/      # Node/TS daemon: claim task, renew lease, stream logs, write run result
├── agents/      # role configs + prompts (CEO, CTO, dev, reviewer)
├── supabase/    # schema.sql, migrations, RLS policies
└── docs/        # plans, Company Handbook, Engineering Standards
```

Do not restructure into this layout unless the current task asks for it.

## Architecture rules (non-negotiable)

1. **The dashboard and the workers never talk directly.** Both only read and write Supabase tables.
2. **The UI never calls Supabase directly.** All data access goes through the `StorageAdapter` interface (`LocalStorageAdapter` for mock mode, `SupabaseAdapter` for live). No DB queries in render functions or event handlers.
3. **Keep the simulator / mock mode working.** It is how the UI gets developed without tokens or a live DB. Live mode is added next to it, never in its place.
4. **Rules live in code and data, not prompts.** Budgets, `allowed_tools`, `door`, `status`, `lease_until` and acceptance criteria are enforced by the system.
5. **Data model names come from the Build Plan §5**: `directives`, `tasks`, `runs`, `run_logs`, `artifacts`, `agents`, `approvals`, `decisions`, `workers`. Use those table and field names (snake_case in the DB).
6. **One-way doors need the Chairman.** Merging to `main`, sending anything outside the company, publishing, deploying or spending money, deleting data, and changing an agent's rules or budget all wait for explicit approval.

## Coding conventions

- Vanilla JS today: ES2020+, no frameworks, no npm packages, no CDN scripts unless approved. Keep the `TaskManager` + `render*` pattern. After any state change, call `saveTasks()` then `renderAll()`.
- **Escape every user- or agent-supplied string** with `escapeHtml()` before putting it in `innerHTML`. Prefer `textContent` where possible.
- Use `showToast(message, type)` for user feedback, not `alert()` / `confirm()`.
- Reuse the CSS custom properties and existing component classes in `styles.css`. Don't add hard-coded colors or one-off styles.
- Must work on a phone (the Chairman approves from mobile). Check narrow widths.
- When v1.3 renames the UI, rename the `localStorage` key and handle the old key, so existing data isn't silently lost.
- Future TS code (worker, agents): strict mode, no `any`, small modules, explicit types for every table row.

## Safety

- Secrets live only in `.env` (git-ignored). Never put them in code, payloads, logs, docs or commits. Never read or print `.env` files.
- Never use the Supabase `service_role` key in the dashboard. The browser gets the `anon` key plus RLS only.
- Don't delete files or data, rewrite git history, force-push, or push to or merge into `main` without being asked.
- Don't edit the plan documents in `docs/` unless the task is to edit them. If code and plan disagree, say so instead of changing the plan.

## Workflow

1. Say which roadmap version or step the change belongs to (e.g. "v1.3 Step 1.3 Approvals Desk").
2. Keep changes small and on a branch. One feature per change.
3. Before saying you're done: serve the page, check the browser console for errors, exercise Kanban + table views, the drawer and the modals, run the simulator, and test **Reset Demo Data**.
4. Update `README.md` when features, structure or run steps change.
5. Report what changed, what you tested, and anything the Chairman needs to decide.
