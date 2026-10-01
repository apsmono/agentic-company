# Agentic Company Cockpit • Task Queue & Executive Dashboard (v1.4.0)

An autonomous AI company command cockpit built with **vanilla HTML5, CSS3, and JavaScript**. Designed for the human **Chairman** to govern and oversee an autonomous software company where AI agents (CEO, CTO, Dev Workers, Reviewer) plan, decompose, and execute engineering tasks under strict corporate governance.

---

## 🌟 Key Features

### 1. Dual-Mode Storage Architecture (`v1.4`)
Seamlessly switch between offline local simulation and live cloud synchronization:
- **Local Mock Mode (Default)**:
  - Zero external dependencies or credentials required.
  - State persisted locally in browser `localStorage` under `agentic_company_tasks_v1`.
  - Built-in simulation engine with log streaming and metrics.
- **Supabase Live Mode**:
  - Connects directly to Supabase Postgres backend using the official JS Client SDK (`@supabase/supabase-js`).
  - Strict security: Only requires public `Project URL` and `anon` key (never uses `service_role` in the browser).
  - Real-time bi-directional synchronization via Supabase Realtime WebSockets (`postgres_changes`).
  - Swappable storage abstraction using the `StorageAdapter` pattern (`LocalStorageAdapter` and `SupabaseAdapter`).

### 2. 6-Stage Governance Pipeline
- **Unified Kanban Pipeline**:
  - `Queued / Backlog`: Ready to be scheduled or claimed by worker daemons.
  - `In Progress / Running`: Active tasks executing on worker pools or AI agent sessions.
  - `1-Way Approval ⚠️`: Critical one-way door actions (merging to `main`, publishing packages, incurring external spend, changing agent rules) paused for Chairman sign-off.
  - `Verifying Results`: Completed jobs under code review or audit.
  - `Completed`: Successful runs (Exit 0).
  - `Failed / Errors`: Errored runs with dead-letter queue dumps and exit codes.
- **Native HTML5 Drag & Drop**: Easily move tasks between columns with drag targets and visual feedback.

### 3. Chairman Governance Desks & Security
- **One-Way Door Approvals Desk**: Dedicated panel tracking pending high-stakes actions with type badges (`PR Merge`, `Budget Cap`, `Deploy`, `Tool Grant`).
- **4-Digit PIN Security Gate**: Chairman PIN gate (default: `1234`) verifies authorization before any one-way door approval can be executed.
- **Directives Inbox**: Create strategic initiatives with budget caps and target deadlines; assigned directly to the CEO Agent (`agent_ceo_01`).
- **Autonomous Agent Roster**: Live roster monitoring system status, active tasks, token spend, and role definitions for `CEO`, `CTO`, `Dev Workers`, and `Reviewer`.
- **Financial Controls & Kill Switch**: Header metrics tracking tokens burned, estimated cloud cost ($ USD), daily budget cap pacing, and an instant **Emergency Kill Switch**.

### 4. Linked Execution Results (Inspector Drawer)
Each task card links to an interactive slide-out **Results Inspector Drawer**:
- **Execution Overview**: Runtime duration, assigned worker node / agent, records processed, exit code, and memory usage.
- **Structured Data Artifacts**: Syntax-highlighted JSON viewer with **Copy JSON** and **Download Artifact** actions.
- **Live Terminal Log Stream**: Color-coded console (`[INFO]`, `[WARN]`, `[ERROR]`, `[SUCCESS]`) with timestamp parsing.
- **Task Parameters & Configuration**: View input payloads dispatched to worker runners.
- **Attached Resources**: Direct links to generated pull requests, artifacts, and cloud logs.

### 5. Real-Time Worker Execution Simulator
- **One-Click Run**: Click "Run Worker Now" on any task or "Run Worker Queue" in the header to simulate AI execution runs.
- **Live Feedback**: Watch tasks transition to `Running`, stream real-time logs, and finish in either `Completed` or `Failed` status with synthesized payloads.

---

## 📁 Repository Structure

```
agentic-company/
├── supabase/
│   └── schema.sql                                 # Complete Postgres DDL, RLS policies, & seed data
├── docs/
│   ├── AGENTIC_COMPANY_BUILD_PLAN.md              # Master Build Plan by @Arif Eko Pramono
│   ├── PLAN_CRITIQUE.md                           # Architectural critique and risk mitigations
│   ├── INCREMENTAL_ROADMAP.md                     # Semantic version rollout (v1.3 -> v2.2)
│   └── ORGANIZATIONAL_STRUCTURE_AND_GOVERNANCE.md # Corporate governance framework & authority matrix
├── index.html                                     # Cockpit UI shell, dialogs, Kanban columns, drawer
├── styles.css                                     # Cyber-refined design system & glassmorphism
├── app.js                                         # StorageAdapters, TaskManager, simulator, PIN gate
├── AGENTS.md                                      # Core instructions & safety rules for AI coding agents
└── README.md                                      # Documentation & setup guide
```

---

## 🗄️ Database Schema (`supabase/schema.sql`)

The repository includes a production-ready PostgreSQL schema designed for Supabase matching the 9 tables defined in the Master Build Plan (§5):

1. `directives`: High-level Chairman goals and strategic mandates.
2. `tasks`: Individual atomic units of work claiming via `FOR UPDATE SKIP LOCKED`.
3. `runs`: Execution attempts by workers or AI agent sessions.
4. `run_logs`: Chunked or streaming log records from workers.
5. `artifacts`: Outputs produced by tasks (diffs, reports, PR URLs).
6. `agents`: Agent profiles, active states, budgets, and capabilities.
7. `approvals`: Formal log of one-way door approvals requested and decided.
8. `decisions`: Strategic decisions recorded by the CEO/CTO.
9. `workers`: Heartbeats and telemetry of background worker daemons.

---

## 🚀 Getting Started

### 1. Run the Dashboard Locally

Serve the repository with any static web server (such as Python's built-in server):

```bash
# From the repository root
python3 -m http.server 4321
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

By default, the cockpit starts in **Local Mock Mode**, requiring no setup or cloud accounts.

### 2. Connecting to Supabase (Optional Cloud Sync)

To enable live multi-client synchronization:

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase SQL Editor, paste and execute [supabase/schema.sql](file:///Users/mbp-m1-pro/Developer/Automation/agentic-company/supabase/schema.sql).
3. In the Cockpit header, click the **Storage Mode** toggle (`💾 Local Mock` / `☁️ Supabase Live`).
4. Enter your **Supabase Project URL** and **Anon Public Key**.
5. Click **Test Connection & Save**. The cockpit will switch to live mode and subscribe to real-time table updates.

### 3. Chairman PIN

To approve any One-Way Door action in the Approvals Desk, you will be prompted for your Chairman PIN.
- Default PIN: `1234`
- The PIN is stored locally in browser storage and can be updated anytime in the Chairman PIN dialog.

---

## 🛡️ Governance & Architecture Rules

- **Dashboard and workers never communicate directly**: Both read and write the Supabase tables.
- **UI never queries Supabase directly**: All data access is routed through the `StorageAdapter` interface.
- **Local simulation is always preserved**: Mock mode remains available for development without incurring token or API costs.
- **One-way doors require Chairman approval**: Reversible actions can proceed autonomously; irreversible actions pause in `approval_pending`.

