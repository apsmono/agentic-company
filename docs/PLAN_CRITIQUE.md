# Architectural & Operational Critique of the Build Plan

**Target Document**: [AGENTIC_COMPANY_BUILD_PLAN.md](file:///Users/mbp-m1-pro/Developer/Automation/agentic-company/docs/AGENTIC_COMPANY_BUILD_PLAN.md)  
**Evaluator**: AI Systems Architect  
**Date**: Oct 1, 2026  

---

## 1. Executive Assessment

The plan is conceptually robust, pragmatic, and remarkably disciplined. It avoids the most common pitfall of multi-agent architectures: **over-engineering cognitive complexity** (e.g., complex multi-tier deliberation, dynamic graph routing, unconstrained inter-agent chat).

### Key Architectural Strengths:
1. **Enforcing Rules in Code / Storage, Not Prompts**: Agents will always suffer from instruction drift and jailbreaks under context pressure. Locking tools, token limits, and task transitions inside Postgres columns (`door`, `status`, `allowed_tools`, `lease_until`) guarantees determinism.
2. **Flat Two-Layer Chain of Command (`Chairman -> CEO -> CTO -> Worker`)**: Information entropy degrades agent output rapidly across delegation layers. Limiting delegation depth to two hops preserves directive fidelity.
3. **Decoupled Asynchronous State Bus (Supabase)**: By treating PostgreSQL as the central message and state broker via `SKIP LOCKED`, neither the dashboard nor the workers maintain direct socket or RPC dependencies on each other. If the Mac mini reboots or goes offline, the dashboard remains fully functional.
4. **Explicit One-Way vs. Two-Way Door Boundaries**: Applying Jeff Bezos's decision framework to autonomous agent permissions provides human safety without choking execution speed.

---

## 2. Critical Vulnerabilities & Hidden Traps

Despite its strong foundations, the plan contains **five critical blindspots** that could derail early execution if not mitigated:

### ⚠️ Trap 1: Decommissioning the Simulator Too Early (Step 1)
- **The Risk**: Step 1 states: *"Remove the simulator and the demo data"*. This is a premature break.
- **Why It Fails**: Developing and iterating on complex dashboard features (Directives inbox, One-Way approvals, token burn charts, multi-agent log inspectors) requires rapid feedback. If the simulator is eliminated in Step 1, every frontend tweak requires a live Supabase connection, a running background daemon, active LLM API credentials, and actual token expenditure.
- **Remedy**: Retain an explicit **"Simulator / Mock Mode"** switch in the dashboard. Allow seamless toggling between Local Mock Simulation (offline testing) and Live Supabase Realtime (production).

---

### ⚠️ Trap 2: The "Autonomous Coding Agent" Cold-Start Leap (Step 3)
- **The Risk**: Step 3 expects the CTO and Dev agents to autonomously create git worktrees, branch off `main`, write implementation code, execute unit tests, and open GitHub pull requests with minimal human intervention.
- **Why It Fails**: In practice, headless coding agents in recursive loops frequently encounter edge cases:
  1. Hallucinating missing dependencies or environment variables.
  2. Git conflicts and dirty worktree states that break headless scripts.
  3. Writing tautological tests that pass without verifying business logic.
  4. Infinite auto-correction loops that deplete token budgets.
- **Remedy**: Introduce **intermediate stepping stones** before attempting autonomous feature programming:
  - *Phase A*: Deterministic scripted workers (linting, file conversions, documentation generation).
  - *Phase B*: Single-prompt bounded LLM jobs (e.g., generating JSON schema, writing an isolated pure function).
  - *Phase C*: Isolated worktree coding agents operating under rigid step timeouts and strict static analysis check-gates.

---

### ⚠️ Trap 3: Domain Gap in the Current Dashboard UI
- **The Risk**: The current dashboard base (`WorkerFlow v1.2`) was engineered for generic data engineering and batch ETL tasks (`node-scraper-01`, `worker-llm-embed-02`).
- **Why It Fails**: It lacks the essential corporate governance primitives outlined in the plan:
  - No interface for the Chairman to input high-level **Directives** or review CEO breakdown plans.
  - No explicit **One-Way Door Approval Desk** to inspect and unblock irreversible actions.
  - No representation of the **Agent Roster & Org Hierarchy** (CEO, CTO, Dev, Reviewer status, current lease, avatar).
  - No visibility into **Token Burn Rate ($ USD)** against budget ceilings.
  - No **Global Kill Switch** for emergency operations.
- **Remedy**: Upgrade the dashboard first to **v1.3 (Corporate Cockpit)** so the entire governance lifecycle can be visualized and verified before backend agents are wired in.

---

### ⚠️ Trap 4: Direct Client-to-DB Coupling
- **The Risk**: Directly embedding Supabase JS queries inside DOM event listeners or UI controllers will tightly couple UI rendering to database schema.
- **Why It Fails**: Any future schema migration (e.g., adding `parent_directive_id`, changing approval states, or switching queue mechanisms) will require touching dozens of frontend UI functions.
- **Remedy**: Introduce a simple **Repository / Storage Adapter Pattern** (`StorageAdapter` interface implemented by `LocalStorageAdapter` and `SupabaseAdapter`).

---

### ⚠️ Trap 5: Network Security & Multi-Device Access
- **The Risk**: The plan envisions the Chairman reviewing approvals and issuing directives from a phone while the worker runs on a local Mac mini.
- **Why It Fails**:
  1. If the static dashboard is hosted via a local IP (`http://192.168.x.x:4321`), it cannot be accessed outside the local Wi-Fi without a VPN or tunnel (e.g., Cloudflare Tunnel / Tailscale).
  2. If the dashboard connects directly to Supabase from the open web using the public `anon` key without Row Level Security (RLS) or Chairman authentication, anyone with the URL could issue directives or approve one-way actions.
- **Remedy**:
  - Implement a basic Chairman PIN / passphrase auth gate on the dashboard.
  - Deploy the frontend statically to GitHub Pages, Vercel, or Firebase Hosting with strict Supabase RLS policies.

---

## 3. Summary Scorecard & Recommendations

| Strategic Dimension | Score (1-10) | Evaluation | Key Action Item |
|---|---|---|---|
| **Governance & Safety** | 9.5 / 10 | Exceptional design with One-Way doors & rules in code. | Maintain emergency kill switch in UI. |
| **Data Model & Queue** | 9.0 / 10 | Postgres `SKIP LOCKED` is battle-tested and simple. | Add indexing for fast lease lookups. |
| **Implementation Path** | 6.5 / 10 | Jumps too quickly from base dashboard to autonomous self-coding. | Decompose into incremental versions (`v1.3` $\rightarrow$ `v1.4` $\rightarrow$ `v2.0` $\rightarrow$ `v2.1` $\rightarrow$ `v2.2`). |
| **Developer Experience** | 6.0 / 10 | Removing simulator too early risks slowing down UI development. | Retain Mock / Dev mode toggle throughout. |

### Architectural Verdict
**Strongly Approved with Sequential Re-ordering.**  
Begin by transforming the existing frontend into the **Agentic Company Cockpit (v1.3)** with rich mock governance data. Once the human-in-the-loop experience is proven, introduce the storage adapter and the headless Mac mini daemon.
