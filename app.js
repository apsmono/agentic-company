/**
 * Agentic Company Cockpit (v1.3.0)
 * Pure Vanilla JavaScript implementation with Corporate Governance,
 * Chairman Directives, One-Way Door Approvals Desk, Agent Roster,
 * Financial Guardrails, HTML5 Drag-and-Drop, and Multi-Agent Simulator.
 */

// ============================================================================
// Agent Personas & Hierarchy Registry
// ============================================================================
const AGENT_ROSTER = [
  {
    id: "ceo",
    name: "CEO Agent",
    role: "Strategic Planning & Executive Delegation",
    status: "Reasoning",
    avatar: "👔",
    reportsTo: "Chairman (Human)",
    model: "Claude 3.7 Sonnet / Opus",
    budget: "$15.00/day",
    tokensUsed: 42800,
    costUsd: 0.86,
    activeTask: "Decomposing Directive DIR-1 into CTO tasks",
    tools: ["plan_initiative", "delegate_task", "audit_financials", "compile_board_memo"]
  },
  {
    id: "cto",
    name: "CTO Agent",
    role: "Technical Architecture & Engineering Standards",
    status: "Auditing",
    avatar: "📐",
    reportsTo: "CEO Agent",
    model: "Claude 3.7 Sonnet",
    budget: "$15.00/day",
    tokensUsed: 68400,
    costUsd: 1.37,
    activeTask: "TASK-103: PR #14 Merge Gate (Awaiting Chairman Approval)",
    tools: ["spec_task", "review_architecture", "manage_worktree", "git_merge"]
  },
  {
    id: "dev-1",
    name: "Dev Worker 01",
    role: "Backend & Core Automation Services",
    status: "Coding",
    avatar: "⚙️",
    reportsTo: "CTO Agent",
    model: "Claude 3.5 Sonnet",
    budget: "$10.00/day",
    tokensUsed: 54100,
    costUsd: 1.08,
    activeTask: "TASK-102: Unit Tests & Static Linter Engine",
    tools: ["read_code", "write_code", "run_unit_tests", "git_commit"]
  },
  {
    id: "dev-2",
    name: "Dev Worker 02",
    role: "Cockpit UI & Frontend Design System",
    status: "Idle",
    avatar: "🎨",
    reportsTo: "CTO Agent",
    model: "Claude 3.5 Sonnet",
    budget: "$10.00/day",
    tokensUsed: 31200,
    costUsd: 0.62,
    activeTask: "Ready for task dispatch",
    tools: ["edit_html", "edit_css", "inspect_dom", "test_views"]
  },
  {
    id: "reviewer",
    name: "Reviewer Agent",
    role: "Code Review & Governance Compliance",
    status: "Auditing",
    avatar: "🔍",
    reportsTo: "CTO Agent",
    model: "Claude 3.7 Sonnet",
    budget: "$5.00/day",
    tokensUsed: 22400,
    costUsd: 0.45,
    activeTask: "TASK-103: Acceptance Criteria & Diff Verification",
    tools: ["audit_diff", "check_acceptance_criteria", "flag_one_way_door"]
  }
];

// ============================================================================
// Default Strategic Directives (Boardroom State)
// ============================================================================
const DEFAULT_DIRECTIVES = [
  {
    id: "DIR-1",
    title: "Autonomous CI/CD & Worktree PR Review Pipeline",
    priority: "high",
    status: "in_progress",
    createdAt: "2026-10-01 08:30",
    budgetAllocated: "$5.00",
    tokensUsed: 52400,
    costUsd: 1.05,
    context: "Establish automated developer agent sandboxes using temporary Git worktrees. Ensure Reviewer agent validates all PR diffs before halting for Chairman One-Way Door merge approval.",
    childTaskIds: ["TASK-101", "TASK-102", "TASK-103"],
    ceoReport: "CEO Note: Decomposed into 3 technical tasks with CTO. TASK-101 (Worktree scaffolding) is complete, TASK-102 is currently coding, and TASK-103 has halted at the One-Way Door gate pending Chairman sign-off."
  },
  {
    id: "DIR-2",
    title: "Corporate Governance Cockpit & Boardroom Dashboard v1.3",
    priority: "urgent",
    status: "completed",
    createdAt: "2026-10-01 08:00",
    budgetAllocated: "$4.00",
    tokensUsed: 38200,
    costUsd: 0.76,
    context: "Upgrade WorkerFlow into the Agentic Company Cockpit with Directives Inbox, One-Way Door Approvals Desk, and Financial Guardrails.",
    childTaskIds: ["TASK-104", "TASK-105"],
    ceoReport: "CEO Delivery Note: UI and governance contracts successfully upgraded. Directives, Approvals Desk, and Agent Roster are live."
  }
];

// ============================================================================
// Default Corporate Tasks (Initial Seed Data)
// ============================================================================
const DEFAULT_TASKS = [
  {
    id: "TASK-101",
    title: "Scaffold Git Worktree Isolation Daemon",
    description: "Build temporary sandbox worktree creator under .worktrees/task-* to isolate agent branch edits.",
    status: "done",
    door: "two_way",
    ownerAgent: "cto",
    worker: "CTO Agent",
    directiveId: "DIR-1",
    priority: "high",
    tags: ["git", "worktree", "sandbox"],
    tokensUsed: 14200,
    costUsd: 0.28,
    createdAt: "2026-10-01 08:45",
    acceptanceCriteria: [
      "Worktree creation script executes cleanly without branch collisions",
      "Auto-cleanup hook cleans directory upon task completion or error",
      "Git status clean check invariant verified"
    ],
    payload: {
      worktreeRoot: ".worktrees",
      branchPrefix: "agent/task-101",
      cleanupPolicy: "always"
    },
    result: {
      status: "success",
      exitCode: 0,
      duration: "3.24s",
      summary: "Worktree daemon initialized: 0 collisions detected across 10 mock branches",
      recordsCount: 10,
      memoryUsage: "48MB",
      executedAt: "2026-10-01 08:48:24",
      data: {
        worktreesMounted: 10,
        cleanupVerified: true,
        exitStatus: "Clean 0"
      },
      logs: [
        "[08:45:00] [INFO] CTO Agent mounting isolated worktree sandbox...",
        "[08:45:01] [INFO] Verifying git core hooks under .worktrees/",
        "[08:46:12] [INFO] Successfully isolated directory branch from main working tree",
        "[08:48:24] [SUCCESS] Scaffolding script tests passed (Exit code 0)"
      ],
      links: [
        { label: "Git Worktree Design Spec", url: "file:///docs/INCREMENTAL_ROADMAP.md" }
      ]
    }
  },
  {
    id: "TASK-102",
    title: "Reviewer Agent Static Security & Linter Engine",
    description: "Configure automated AST security scanner to audit proposed PR diffs against engineering standards.",
    status: "running",
    door: "two_way",
    ownerAgent: "dev-1",
    worker: "Dev Worker 01",
    directiveId: "DIR-1",
    priority: "urgent",
    tags: ["security", "linter", "ast"],
    tokensUsed: 21800,
    costUsd: 0.44,
    createdAt: "2026-10-01 09:15",
    acceptanceCriteria: [
      "Scans diff for hardcoded API keys or leaked secrets",
      "Checks unit test coverage for new functions > 85%",
      "Emits structured review output conforming to PR schema"
    ],
    payload: {
      ruleset: "strict-security",
      entropyCheck: true,
      maxTokenBudget: 30000
    },
    result: {
      status: "running",
      exitCode: "—",
      duration: "45.1s",
      summary: "In progress: Scanned 12 AST rule nodes, 0 secrets detected so far",
      recordsCount: 12,
      memoryUsage: "112MB",
      executedAt: "2026-10-01 09:15:10",
      data: {
        rulesEvaluated: 12,
        violations: 0,
        coverageScore: "94%"
      },
      logs: [
        "[09:15:10] [INFO] Dev Worker 01 running AST rule checks...",
        "[09:15:18] [INFO] Scanning commit diff against regex secret database...",
        "[09:15:40] [INFO] 0 high-entropy keys found. Checking test coverage..."
      ],
      links: []
    }
  },
  {
    id: "TASK-103",
    title: "Merge PR #14: CI/CD Security Gate to main",
    description: "One-Way Door: Merge pull request #14 into production branch. Irreversible action waiting for Chairman authorization.",
    status: "approval_pending",
    door: "one_way",
    ownerAgent: "cto",
    worker: "CTO Agent",
    directiveId: "DIR-1",
    priority: "urgent",
    tags: ["pr-merge", "one-way-door", "production"],
    tokensUsed: 16400,
    costUsd: 0.33,
    createdAt: "2026-10-01 09:30",
    acceptanceCriteria: [
      "Reviewer Agent peer audit approved with 0 blockers",
      "All unit and integration test suites exit with code 0",
      "Explicit Chairman One-Way Door sign-off obtained"
    ],
    payload: {
      prNumber: 14,
      targetBranch: "main",
      sourceBranch: "feature/ci-cd-security-pipeline",
      authorAgent: "Dev Worker 01",
      reviewerAgent: "Reviewer Agent",
      blastRadius: "Modifies CI/CD production deployment pipeline on GitHub"
    },
    result: {
      status: "partial",
      exitCode: "PAUSED",
      duration: "18.2s",
      summary: "Audits passed. Halted at One-Way Door: Requires Chairman sign-off.",
      recordsCount: 1,
      memoryUsage: "64MB",
      executedAt: "2026-10-01 09:32:15",
      data: {
        prTitle: "Feat: Automated Security Scanner Hook",
        diffSummary: "+148 lines, -12 lines across 3 files",
        testsRun: 24,
        testsPassed: 24,
        reviewerAuditVerdict: "Approved (Score 10/10)"
      },
      logs: [
        "[09:30:00] [INFO] CTO Agent inspecting PR #14 payload...",
        "[09:31:10] [INFO] Reviewer Agent: Acceptance criteria verified. All 24 test suites passed.",
        "[09:32:00] [WARN] Action flagged as ONE-WAY DOOR: Merging to production main.",
        "[09:32:15] [WARN] Execution halted. Transferred to Chairman Approvals Desk."
      ],
      links: [
        { label: "Pull Request #14 on GitHub", url: "https://github.com/apsmono/agentic-company/pull/14" }
      ]
    }
  },
  {
    id: "TASK-104",
    title: "Corporate Governance Cockpit & Boardroom v1.3",
    description: "Design and implement the Chairman Directives inbox, Approvals Desk, and real-time Agent Roster.",
    status: "done",
    door: "two_way",
    ownerAgent: "dev-2",
    worker: "Dev Worker 02",
    directiveId: "DIR-2",
    priority: "high",
    tags: ["ui", "governance", "cockpit"],
    tokensUsed: 22100,
    costUsd: 0.44,
    createdAt: "2026-10-01 07:30",
    acceptanceCriteria: [
      "Directives Inbox UI enables Chairman input and status tracking",
      "One-Way Door Approvals Desk with decision modal",
      "Agent Roster with live hierarchy and allowed tools",
      "Zero-build vanilla HTML/CSS/JS with mobile responsiveness"
    ],
    payload: {
      version: "1.3.0",
      theme: "cyber-refined glassmorphism"
    },
    result: {
      status: "success",
      exitCode: 0,
      duration: "2.10s",
      summary: "Corporate Cockpit v1.3 rendered with 0 console warnings",
      recordsCount: 5,
      memoryUsage: "32MB",
      executedAt: "2026-10-01 07:32:10",
      data: {
        componentsRendered: ["Directives", "ApprovalsDesk", "AgentRoster", "MetricsGauges"],
        responsiveBreakpoints: ["desktop", "tablet", "mobile"]
      },
      logs: [
        "[07:30:00] [INFO] Dev Worker 02 loading component templates...",
        "[07:31:20] [INFO] Verified glassmorphic contrast ratios and mobile tap targets",
        "[07:32:10] [SUCCESS] Cockpit v1.3 build successfully validated."
      ],
      links: []
    }
  },
  {
    id: "TASK-105",
    title: "Weekly Board Memo & Autonomous Executive Report",
    description: "Compile weekly token burn, PR velocity, active bottlenecks, and strategic decisions for the Chairman.",
    status: "review",
    door: "two_way",
    ownerAgent: "ceo",
    worker: "CEO Agent",
    directiveId: "DIR-2",
    priority: "medium",
    tags: ["report", "executive", "board"],
    tokensUsed: 16100,
    costUsd: 0.32,
    createdAt: "2026-10-01 08:00",
    acceptanceCriteria: [
      "Summarizes tokens burned vs daily ceiling",
      "Highlights blocked one-way doors",
      "Generates markdown briefing memo in structured artifacts"
    ],
    payload: {
      period: "Week 40 - 2026",
      format: "executive-briefing"
    },
    result: {
      status: "partial",
      exitCode: 0,
      duration: "1.95s",
      summary: "Board report draft compiled; waiting for human review",
      recordsCount: 1,
      memoryUsage: "40MB",
      executedAt: "2026-10-01 08:01:55",
      data: {
        totalWeeklySpend: "$7.82",
        budgetVariance: "-12% under ceiling",
        keyBlocker: "Awaiting Chairman sign-off on PR #14"
      },
      logs: [
        "[08:00:00] [INFO] CEO Agent aggregating database metrics...",
        "[08:00:45] [INFO] Generated weekly executive memo draft",
        "[08:01:55] [SUCCESS] Report attached. Ready for Chairman reading."
      ],
      links: [
        { label: "Executive Board Memo Draft", url: "file:///docs/AGENTIC_COMPANY_BUILD_PLAN.md" }
      ]
    }
  },
  {
    id: "TASK-106",
    title: "Configure Cloudflare Production Edge Security Rules",
    description: "Apply rate limiting, strict CSP headers, and TLS 1.3 enforcement on public ingress routes.",
    status: "backlog",
    door: "one_way",
    ownerAgent: "cto",
    worker: "CTO Agent",
    directiveId: "DIR-2",
    priority: "medium",
    tags: ["security", "cloudflare", "headers"],
    tokensUsed: 0,
    costUsd: 0.00,
    createdAt: "2026-10-01 10:00",
    acceptanceCriteria: [
      "CSP headers configured without unsafe-eval",
      "Rate limiting policy locks at 100 req/min per IP",
      "Chairman sign-off required prior to production push"
    ],
    payload: {
      zone: "agentic-company.internal",
      tlsVersion: "1.3"
    },
    result: null
  }
];

// ============================================================================
// Application State Manager (TaskManager)
// ============================================================================
class TaskManager {
  constructor() {
    this.storageKey = "agentic_company_tasks_v1";
    this.legacyKey = "workerflow_tasks_v1";
    this.directivesKey = "agentic_company_directives_v1";

    this.tasks = this.loadTasks();
    this.directives = this.loadDirectives();
    this.agents = AGENT_ROSTER;

    this.activeTaskId = null;
    this.currentView = "kanban"; // "kanban", "approvals", "directives", "agents", "table"
    this.searchQuery = "";
    this.killSwitchActive = false;

    this.filters = {
      priority: "all",
      door: "all",
      worker: "all",
      result: "all"
    };
  }

  loadTasks() {
    try {
      // Check modern storage key first
      let saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }

      // Check and migrate legacy WorkerFlow key
      const legacySaved = localStorage.getItem(this.legacyKey);
      if (legacySaved) {
        const parsed = JSON.parse(legacySaved);
        // Persist into modern key without deleting user work
        localStorage.setItem(this.storageKey, JSON.stringify(parsed));
        return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse stored tasks, falling back to corporate defaults.", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_TASKS));
  }

  saveTasks() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
    } catch (e) {
      console.error("Failed to save tasks to localStorage:", e);
    }
  }

  loadDirectives() {
    try {
      const saved = localStorage.getItem(this.directivesKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load directives, falling back to default.", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DIRECTIVES));
  }

  saveDirectives() {
    try {
      localStorage.setItem(this.directivesKey, JSON.stringify(this.directives));
    } catch (e) {
      console.error("Failed to save directives to localStorage:", e);
    }
  }

  resetToDefault() {
    this.tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
    this.directives = JSON.parse(JSON.stringify(DEFAULT_DIRECTIVES));
    this.killSwitchActive = false;
    this.saveTasks();
    this.saveDirectives();
  }

  getAllTasks() {
    return this.tasks;
  }

  getFilteredTasks() {
    return this.tasks.filter(task => {
      // Search query
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = (task.description || "").toLowerCase().includes(q);
        const matchesId = task.id.toLowerCase().includes(q);
        const matchesWorker = (task.worker || "").toLowerCase().includes(q);
        const matchesTags = (task.tags || []).some(t => t.toLowerCase().includes(q));
        const matchesResult = task.result && (
          (task.result.summary || "").toLowerCase().includes(q) ||
          (task.result.status || "").toLowerCase().includes(q)
        );

        if (!matchesTitle && !matchesDesc && !matchesId && !matchesWorker && !matchesTags && !matchesResult) {
          return false;
        }
      }

      // Priority filter
      if (this.filters.priority !== "all" && task.priority !== this.filters.priority) {
        return false;
      }

      // Door filter
      if (this.filters.door !== "all" && (task.door || "two_way") !== this.filters.door) {
        return false;
      }

      // Assigned Agent/Worker filter
      if (this.filters.worker !== "all") {
        const taskAgent = (task.ownerAgent || task.worker || "").toLowerCase();
        if (!taskAgent.includes(this.filters.worker.toLowerCase())) {
          return false;
        }
      }

      // Result status filter
      if (this.filters.result === "with-results" && !task.result) return false;
      if (this.filters.result === "no-results" && task.result) return false;
      if (this.filters.result === "success-results" && (!task.result || task.result.status !== "success")) return false;
      if (this.filters.result === "failure-results" && (!task.result || task.result.status !== "failure")) return false;

      return true;
    });
  }

  getTaskById(id) {
    return this.tasks.find(t => t.id === id);
  }

  addTask(taskData) {
    const nextNum = this.tasks.length + 101;
    const newTask = {
      id: `TASK-${nextNum}`,
      title: taskData.title,
      description: taskData.description || "",
      status: taskData.status || "backlog",
      door: taskData.door || "two_way",
      ownerAgent: taskData.ownerAgent || "cto",
      worker: taskData.worker || "CTO Agent",
      directiveId: taskData.directiveId || null,
      priority: taskData.priority || "medium",
      tags: taskData.tags || [],
      acceptanceCriteria: taskData.acceptanceCriteria || [],
      tokensUsed: 0,
      costUsd: 0.00,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      payload: taskData.payload || {},
      result: null
    };
    this.tasks.unshift(newTask);
    this.saveTasks();
    return newTask;
  }

  updateTask(id, updates) {
    const task = this.getTaskById(id);
    if (!task) return null;
    Object.assign(task, updates);
    this.saveTasks();
    return task;
  }

  updateTaskStatus(id, newStatus) {
    const task = this.getTaskById(id);
    if (!task) return null;
    task.status = newStatus;
    this.saveTasks();
    return task;
  }

  attachResult(id, resultData) {
    const task = this.getTaskById(id);
    if (!task) return null;
    task.result = resultData;
    this.saveTasks();
    return task;
  }

  deleteTask(id) {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.tasks.splice(idx, 1);
      this.saveTasks();
      return true;
    }
    return false;
  }

  // Directives methods
  getDirectives() {
    return this.directives;
  }

  addDirective(dirData) {
    const nextId = `DIR-${this.directives.length + 1}`;
    const newDir = {
      id: nextId,
      title: dirData.title,
      priority: dirData.priority || "high",
      status: "in_progress",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      budgetAllocated: dirData.budgetAllocated || "$5.00",
      tokensUsed: 0,
      costUsd: 0.00,
      context: dirData.context || "",
      childTaskIds: [],
      ceoReport: "CEO Note: Directive received from Chairman. Currently analyzing technical requirements and preparing CTO task decomposition."
    };
    this.directives.unshift(newDir);
    this.saveDirectives();
    return newDir;
  }

  // Approvals Desk
  getApprovals() {
    return this.tasks.filter(t => t.status === "approval_pending" || (t.door === "one_way" && t.status === "review"));
  }

  approveOneWayTask(taskId, chairmanNotes = "") {
    const task = this.getTaskById(taskId);
    if (!task) return false;

    task.status = "done";
    const ts = new Date().toLocaleTimeString();
    if (!task.result) {
      task.result = {
        status: "success",
        exitCode: 0,
        duration: "1.2s",
        summary: "One-Way Door Authorized & Executed by Chairman",
        logs: []
      };
    } else {
      task.result.status = "success";
      task.result.exitCode = 0;
      task.result.summary = "One-Way Door Authorized: Action executed cleanly.";
    }

    task.result.logs = task.result.logs || [];
    task.result.logs.push(`[${ts}] [CHAIRMAN SIGN-OFF] Authorized by Chairman.`);
    if (chairmanNotes) {
      task.result.logs.push(`[${ts}] [CHAIRMAN NOTES] ${chairmanNotes}`);
    }
    task.result.logs.push(`[${ts}] [SUCCESS] Task completed. Action merged/dispatched.`);

    this.saveTasks();
    return true;
  }

  rejectOneWayTask(taskId, reason = "Rejected by Chairman") {
    const task = this.getTaskById(taskId);
    if (!task) return false;

    task.status = "failed";
    const ts = new Date().toLocaleTimeString();
    if (!task.result) {
      task.result = { status: "failure", exitCode: 1, duration: "—", summary: "Rejected by Chairman", logs: [] };
    }
    task.result.status = "failure";
    task.result.exitCode = 1;
    task.result.summary = `Aborted by Chairman: ${reason}`;
    task.result.logs = task.result.logs || [];
    task.result.logs.push(`[${ts}] [CHAIRMAN REJECTION] ${reason}`);

    this.saveTasks();
    return true;
  }

  reviseOneWayTask(taskId, feedback = "Revision requested") {
    const task = this.getTaskById(taskId);
    if (!task) return false;

    task.status = "running";
    const ts = new Date().toLocaleTimeString();
    task.result = task.result || { logs: [] };
    task.result.status = "running";
    task.result.summary = `Revising work based on Chairman guidance: ${feedback}`;
    task.result.logs = task.result.logs || [];
    task.result.logs.push(`[${ts}] [CHAIRMAN REVISION GUIDANCE] ${feedback}`);

    this.saveTasks();
    return true;
  }

  // Kill Switch
  toggleKillSwitch() {
    this.killSwitchActive = !this.killSwitchActive;
    return this.killSwitchActive;
  }

  // Metrics calculation
  getMetrics() {
    const total = this.tasks.length;
    const running = this.tasks.filter(t => t.status === "running").length;
    const approvalCount = this.getApprovals().length;
    const done = this.tasks.filter(t => t.status === "done").length;
    const failed = this.tasks.filter(t => t.status === "failed" || (t.result && t.result.status === "failure")).length;

    let totalTokens = 0;
    let totalCost = 0;
    this.tasks.forEach(t => {
      totalTokens += (t.tokensUsed || 0);
      totalCost += (t.costUsd || 0);
    });

    const successTasks = this.tasks.filter(t => t.result && t.result.status === "success").length;
    const completedWithResult = this.tasks.filter(t => t.result && t.result.status).length;
    const rate = completedWithResult > 0 ? Math.round((successTasks / completedWithResult) * 100) : 0;

    return {
      total,
      running,
      approvals: approvalCount,
      done,
      failed,
      tokens: totalTokens,
      cost: totalCost,
      rate
    };
  }

  getWorkerList() {
    const workers = new Set();
    this.tasks.forEach(t => {
      const w = t.worker || (t.ownerAgent ? t.ownerAgent.toUpperCase() : null);
      if (w) workers.add(w);
    });
    // Add registered agent names
    this.agents.forEach(a => workers.add(a.name));
    return Array.from(workers);
  }
}

// Instantiate state manager
const appState = new TaskManager();

// ============================================================================
// UI Elements & DOM Cache
// ============================================================================
const dom = {
  // Metrics & Financial Guardrails
  metricTotal: document.getElementById("metricTotal"),
  metricRunning: document.getElementById("metricRunning"),
  metricApproval: document.getElementById("metricApproval"),
  metricSuccess: document.getElementById("metricSuccess"),
  metricTokens: document.getElementById("metricTokens"),
  metricCost: document.getElementById("metricCost"),
  metricCeiling: document.getElementById("metricCeiling"),
  pillApproval: document.getElementById("pillApproval"),

  // Header Actions
  btnKillSwitch: document.getElementById("btnKillSwitch"),
  killSwitchText: document.getElementById("killSwitchText"),
  btnNewDirective: document.getElementById("btnNewDirective"),
  btnNewTask: document.getElementById("btnNewTask"),
  btnSimulateAll: document.getElementById("btnSimulateAll"),
  btnResetDemo: document.getElementById("btnResetDemo"),

  // Search & Filter controls
  searchInput: document.getElementById("searchInput"),
  clearSearch: document.getElementById("clearSearch"),
  filterPriority: document.getElementById("filterPriority"),
  filterDoor: document.getElementById("filterDoor"),
  filterWorker: document.getElementById("filterWorker"),
  filterResult: document.getElementById("filterResult"),

  // View switchers
  viewKanbanBtn: document.getElementById("viewKanbanBtn"),
  viewApprovalsBtn: document.getElementById("viewApprovalsBtn"),
  viewDirectivesBtn: document.getElementById("viewDirectivesBtn"),
  viewAgentsBtn: document.getElementById("viewAgentsBtn"),
  viewTableBtn: document.getElementById("viewTableBtn"),
  badgeApprovalsCount: document.getElementById("badgeApprovalsCount"),

  // Main containers & sections
  kanbanBoard: document.getElementById("kanbanBoard"),
  approvalsSection: document.getElementById("approvalsSection"),
  approvalsDeskGrid: document.getElementById("approvalsDeskGrid"),
  approvalsDeskCount: document.getElementById("approvalsDeskCount"),
  directivesSection: document.getElementById("directivesSection"),
  directivesGrid: document.getElementById("directivesGrid"),
  btnOpenDirectiveFormModal: document.getElementById("btnOpenDirectiveFormModal"),
  agentsSection: document.getElementById("agentsSection"),
  agentsGrid: document.getElementById("agentsGrid"),
  tableViewContainer: document.getElementById("tableViewContainer"),
  matrixTableBody: document.getElementById("matrixTableBody"),

  // Columns & Counters
  colCards: {
    backlog: document.getElementById("cards-backlog"),
    running: document.getElementById("cards-running"),
    approval_pending: document.getElementById("cards-approval_pending"),
    review: document.getElementById("cards-review"),
    done: document.getElementById("cards-done"),
    failed: document.getElementById("cards-failed")
  },
  colCounts: {
    backlog: document.getElementById("count-backlog"),
    running: document.getElementById("count-running"),
    approval_pending: document.getElementById("count-approval_pending"),
    review: document.getElementById("count-review"),
    done: document.getElementById("count-done"),
    failed: document.getElementById("count-failed")
  },

  // Drawer Elements
  drawer: document.getElementById("resultsDrawer"),
  drawerBackdrop: document.getElementById("drawerBackdrop"),
  btnCloseDrawer: document.getElementById("btnCloseDrawer"),
  drawerTaskId: document.getElementById("drawerTaskId"),
  drawerStatusPill: document.getElementById("drawerStatusPill"),
  drawerResultBadge: document.getElementById("drawerResultBadge"),
  drawerTaskTitle: document.getElementById("drawerTaskTitle"),
  drawerTaskDesc: document.getElementById("drawerTaskDesc"),
  statDuration: document.getElementById("statDuration"),
  statWorker: document.getElementById("statWorker"),
  statRecords: document.getElementById("statRecords"),
  statExitCode: document.getElementById("statExitCode"),
  btnSimulateTask: document.getElementById("btnSimulateTask"),
  btnEditTaskFromDrawer: document.getElementById("btnEditTaskFromDrawer"),
  btnAddResultManual: document.getElementById("btnAddResultManual"),
  btnDeleteTask: document.getElementById("btnDeleteTask"),
  artifactJsonContent: document.getElementById("artifactJsonContent"),
  terminalLogs: document.getElementById("terminalLogs"),
  taskPayloadContent: document.getElementById("taskPayloadContent"),
  resourcesList: document.getElementById("resourcesList"),
  btnCopyResultJson: document.getElementById("btnCopyResultJson"),
  btnDownloadResult: document.getElementById("btnDownloadResult"),
  btnCopyLogs: document.getElementById("btnCopyLogs"),
  btnAddExternalLink: document.getElementById("btnAddExternalLink"),

  // Task Dialog
  taskModal: document.getElementById("taskModal"),
  taskForm: document.getElementById("taskForm"),
  taskFormId: document.getElementById("taskFormId"),
  modalTaskTitle: document.getElementById("modalTaskTitle"),
  inputTaskTitle: document.getElementById("inputTaskTitle"),
  selectTaskStatus: document.getElementById("selectTaskStatus"),
  selectTaskDoor: document.getElementById("selectTaskDoor"),
  selectTaskAgent: document.getElementById("selectTaskAgent"),
  selectTaskPriority: document.getElementById("selectTaskPriority"),
  selectTaskDirective: document.getElementById("selectTaskDirective"),
  inputTaskTags: document.getElementById("inputTaskTags"),
  inputTaskDesc: document.getElementById("inputTaskDesc"),
  inputTaskCriteria: document.getElementById("inputTaskCriteria"),
  inputTaskPayload: document.getElementById("inputTaskPayload"),
  btnCloseTaskModal: document.getElementById("btnCloseTaskModal"),
  btnCancelTaskModal: document.getElementById("btnCancelTaskModal"),

  // Directive Dialog
  directiveModal: document.getElementById("directiveModal"),
  directiveForm: document.getElementById("directiveForm"),
  inputDirectiveTitle: document.getElementById("inputDirectiveTitle"),
  selectDirectivePriority: document.getElementById("selectDirectivePriority"),
  inputDirectiveBudget: document.getElementById("inputDirectiveBudget"),
  inputDirectiveContext: document.getElementById("inputDirectiveContext"),
  btnCloseDirectiveModal: document.getElementById("btnCloseDirectiveModal"),
  btnCancelDirectiveModal: document.getElementById("btnCancelDirectiveModal"),

  // One-Way Door Approval Dialog
  approvalModal: document.getElementById("approvalModal"),
  approvalTaskId: document.getElementById("approvalTaskId"),
  approvalActionName: document.getElementById("approvalActionName"),
  approvalRequestingAgent: document.getElementById("approvalRequestingAgent"),
  approvalTokenCost: document.getElementById("approvalTokenCost"),
  approvalBlastRadiusDesc: document.getElementById("approvalBlastRadiusDesc"),
  approvalCriteriaList: document.getElementById("approvalCriteriaList"),
  approvalPayloadDiff: document.getElementById("approvalPayloadDiff"),
  inputApprovalNotes: document.getElementById("inputApprovalNotes"),
  btnCloseApprovalModal: document.getElementById("btnCloseApprovalModal"),
  btnCancelApprovalModal: document.getElementById("btnCancelApprovalModal"),
  btnRejectApproval: document.getElementById("btnRejectApproval"),
  btnReviseApproval: document.getElementById("btnReviseApproval"),
  btnApproveAction: document.getElementById("btnApproveAction"),

  // Result & Link Dialogs
  resultModal: document.getElementById("resultModal"),
  resultForm: document.getElementById("resultForm"),
  resultFormTaskId: document.getElementById("resultFormTaskId"),
  selectResultStatus: document.getElementById("selectResultStatus"),
  inputResultDuration: document.getElementById("inputResultDuration"),
  inputResultSummary: document.getElementById("inputResultSummary"),
  inputResultExitCode: document.getElementById("inputResultExitCode"),
  inputResultJson: document.getElementById("inputResultJson"),
  inputResultLogs: document.getElementById("inputResultLogs"),
  btnCloseResultModal: document.getElementById("btnCloseResultModal"),
  btnCancelResultModal: document.getElementById("btnCancelResultModal"),

  linkModal: document.getElementById("linkModal"),
  linkForm: document.getElementById("linkForm"),
  inputLinkLabel: document.getElementById("inputLinkLabel"),
  inputLinkUrl: document.getElementById("inputLinkUrl"),
  btnCloseLinkModal: document.getElementById("btnCloseLinkModal"),
  btnCancelLinkModal: document.getElementById("btnCancelLinkModal"),

  toastContainer: document.getElementById("toastContainer")
};

// Current pending task in approval modal
let currentApprovalTaskId = null;

// ============================================================================
// Helper Utilities
// ============================================================================
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button type="button" style="background:none; border:none; color:currentColor; cursor:pointer; font-size:1.1rem;">&times;</button>
  `;

  toast.querySelector("button").addEventListener("click", () => toast.remove());
  dom.toastContainer.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 4200);
}

// ============================================================================
// UI Renderers
// ============================================================================
function renderMetrics() {
  const m = appState.getMetrics();
  dom.metricTotal.textContent = m.total;
  dom.metricRunning.textContent = m.running;
  dom.metricApproval.textContent = m.approvals;
  dom.metricSuccess.textContent = m.done;

  // Format tokens and cost
  const kTokens = (m.tokens / 1000).toFixed(1);
  dom.metricTokens.textContent = `${kTokens}k`;
  dom.metricCost.textContent = `$${m.cost.toFixed(2)}`;

  // Approvals badge in view button
  if (dom.badgeApprovalsCount) {
    dom.badgeApprovalsCount.textContent = m.approvals;
    dom.badgeApprovalsCount.style.display = m.approvals > 0 ? "inline-block" : "none";
  }

  // Approvals desk counter
  if (dom.approvalsDeskCount) {
    dom.approvalsDeskCount.textContent = m.approvals;
  }
}

function updateWorkerFilterOptions() {
  const currentVal = dom.filterWorker.value;
  const workers = appState.getWorkerList();

  dom.filterWorker.innerHTML = '<option value="all">All Assigned Agents</option>';
  workers.forEach(w => {
    const opt = document.createElement("option");
    opt.value = w;
    opt.textContent = w;
    dom.filterWorker.appendChild(opt);
  });

  if (workers.includes(currentVal)) {
    dom.filterWorker.value = currentVal;
  }
}

function renderKanban() {
  // Clear columns
  Object.values(dom.colCards).forEach(el => {
    if (el) el.innerHTML = "";
  });

  const filteredTasks = appState.getFilteredTasks();
  const columnCounts = {
    backlog: 0,
    running: 0,
    approval_pending: 0,
    review: 0,
    done: 0,
    failed: 0
  };

  filteredTasks.forEach(task => {
    const colStatus = task.status || "backlog";
    if (columnCounts[colStatus] !== undefined) {
      columnCounts[colStatus]++;
    }

    const card = createTaskCardElement(task);
    if (dom.colCards[colStatus]) {
      dom.colCards[colStatus].appendChild(card);
    }
  });

  // Update counters
  Object.keys(columnCounts).forEach(status => {
    if (dom.colCounts[status]) {
      dom.colCounts[status].textContent = columnCounts[status];
    }
  });
}

function createTaskCardElement(task) {
  const card = document.createElement("article");
  card.className = "task-card";
  card.draggable = true;
  card.id = `card-${task.id}`;
  card.dataset.taskId = task.id;

  if (task.status === "approval_pending") {
    card.classList.add("card-one-way-pending");
  }

  // HTML5 Drag listeners
  card.addEventListener("dragstart", handleDragStart);
  card.addEventListener("dragend", handleDragEnd);

  // Door badge
  const isOneWay = (task.door === "one_way");
  const doorBadgeHtml = isOneWay
    ? `<span class="badge-one-way" title="Irreversible: Requires Chairman sign-off">⚠️ 1-Way Gate</span>`
    : `<span class="badge-two-way" title="Reversible: Autonomous execution">⚡ 2-Way</span>`;

  // Result Badge / Hook
  let resultBoxHtml = "";
  if (task.result) {
    const resStatus = task.result.status || "none";
    let statusClass = "none";
    let statusText = "No Result";

    if (resStatus === "success") {
      statusClass = "has-success";
      statusText = "🟢 Completed Cleanly";
    } else if (resStatus === "failure") {
      statusClass = "has-failed";
      statusText = "🔴 Failed / Error";
    } else if (resStatus === "running") {
      statusClass = "has-running";
      statusText = "⚡ Executing...";
    } else if (resStatus === "partial") {
      statusClass = "has-running";
      statusText = task.status === "approval_pending" ? "⚠️ One-Way Sign-off Pending" : "🟡 In Review";
    }

    resultBoxHtml = `
      <div class="card-result-box ${statusClass}" data-action="open-result" title="Click to inspect output and logs">
        <div class="result-top-info">
          <span class="result-status-tag ${resStatus}">${statusText}</span>
          <span class="result-duration">${task.result.duration || ""}</span>
        </div>
        <div class="result-summary-text">${escapeHtml(task.result.summary || "View output data & logs")}</div>
      </div>
    `;
  } else {
    resultBoxHtml = `
      <div class="card-result-box no-results" data-action="open-result" title="Click to view details or attach result">
        <div class="result-top-info">
          <span class="result-status-tag none">⚪ Ready in Queue</span>
          <span class="result-duration">Queued</span>
        </div>
        <div class="result-summary-text">Ready for execution runner</div>
      </div>
    `;
  }

  // Tags
  const tagsHtml = (task.tags || [])
    .map(t => `<span class="tag-pill">#${escapeHtml(t)}</span>`)
    .join("");

  // Agent name
  const agentDisplayName = task.worker || (task.ownerAgent ? task.ownerAgent.toUpperCase() : "CTO Agent");

  card.innerHTML = `
    <div class="card-top-row">
      <div style="display:flex; align-items:center; gap:0.4rem;">
        <span class="task-id-badge">${escapeHtml(task.id)}</span>
        ${doorBadgeHtml}
      </div>
      <span class="priority-badge priority-${task.priority}">${task.priority}</span>
    </div>
    <div class="card-title" data-action="open-drawer">${escapeHtml(task.title)}</div>
    ${task.description ? `<p class="card-desc">${escapeHtml(task.description)}</p>` : ""}
    <div class="card-worker">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="2" width="20" height="8" rx="2"></rect>
        <rect x="2" y="14" width="20" height="8" rx="2"></rect>
        <line x1="6" y1="6" x2="6.01" y2="6"></line>
        <line x1="6" y1="18" x2="6.01" y2="18"></line>
      </svg>
      <span>${escapeHtml(agentDisplayName)}</span>
      ${task.directiveId ? `<span style="margin-left:auto; font-family:var(--font-mono); font-size:0.68rem; color:var(--accent-cyan);">${escapeHtml(task.directiveId)}</span>` : ""}
    </div>
    ${tagsHtml ? `<div class="card-tags">${tagsHtml}</div>` : ""}
    ${resultBoxHtml}
    <div class="card-footer">
      <span class="card-timestamp">${escapeHtml(task.createdAt || "")}</span>
      <div class="card-action-links">
        ${task.status === "approval_pending" ? `
          <button type="button" class="btn-card-action action-signoff" data-action="open-approval" title="Review and authorize One-Way action">
            <span>✍️ Sign Off</span>
          </button>
        ` : ""}
        <button type="button" class="btn-card-action action-inspect" data-action="open-drawer" title="Inspect Results & Logs">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span>Logs</span>
        </button>
        <button type="button" class="btn-card-action" data-action="quick-run" title="Run agent execution">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>
      </div>
    </div>
  `;

  // Card click actions
  card.addEventListener("click", e => {
    const actionEl = e.target.closest("[data-action]");
    if (actionEl) {
      const action = actionEl.dataset.action;
      if (action === "open-approval") {
        openApprovalModal(task.id);
      } else if (action === "open-drawer" || action === "open-result") {
        openResultsDrawer(task.id);
      } else if (action === "quick-run") {
        simulateWorkerRun(task.id);
      }
    } else {
      if (task.status === "approval_pending") {
        openApprovalModal(task.id);
      } else {
        openResultsDrawer(task.id);
      }
    }
  });

  return card;
}

function renderTableView() {
  dom.matrixTableBody.innerHTML = "";
  const tasks = appState.getFilteredTasks();

  if (tasks.length === 0) {
    dom.matrixTableBody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 2rem; color: var(--text-dim);">
          No tasks found matching your filters.
        </td>
      </tr>
    `;
    return;
  }

  tasks.forEach(task => {
    const tr = document.createElement("tr");

    let resultStatusBadge = `<span class="result-badge none">No Result</span>`;
    let durationText = "—";
    let summaryText = "—";

    if (task.result) {
      const st = task.result.status;
      resultStatusBadge = `<span class="result-badge ${st}">${st.toUpperCase()}</span>`;
      durationText = task.result.duration || "—";
      summaryText = task.result.summary || "Completed";
    }

    const doorBadge = (task.door === "one_way")
      ? `<span class="badge-one-way">1-Way ⚠️</span>`
      : `<span class="badge-two-way">2-Way ⚡</span>`;

    const tokensStr = task.tokensUsed ? `${(task.tokensUsed / 1000).toFixed(1)}k ($${(task.costUsd || 0).toFixed(2)})` : "—";

    tr.innerHTML = `
      <td><span class="task-id-badge">${escapeHtml(task.id)}</span></td>
      <td>
        <div style="font-weight: 600; color: var(--text-main); cursor: pointer;" class="table-task-link">${escapeHtml(task.title)}</div>
        <div style="font-size: 0.72rem; color: var(--text-dim); font-family: var(--font-mono);">${escapeHtml(task.worker || "unassigned")}</div>
      </td>
      <td>${doorBadge}</td>
      <td><span class="status-pill status-${task.status}">${task.status}</span></td>
      <td><span class="priority-badge priority-${task.priority}">${task.priority}</span></td>
      <td>${resultStatusBadge}</td>
      <td style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-cyan);">${escapeHtml(tokensStr)}</td>
      <td style="font-family: var(--font-mono); font-size: 0.8rem;">${escapeHtml(durationText)}</td>
      <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-muted); font-size: 0.8rem;">
        ${escapeHtml(summaryText)}
      </td>
      <td>
        <div style="display: flex; gap: 0.4rem;">
          ${task.status === "approval_pending" ? `
            <button type="button" class="btn btn-sm btn-primary" data-action="sign-off" title="Sign Off">✍️</button>
          ` : ""}
          <button type="button" class="btn btn-sm btn-ghost" data-action="view-results" title="Inspect Results">Logs</button>
          <button type="button" class="btn btn-sm btn-secondary" data-action="run-task" title="Run Task">▶</button>
        </div>
      </td>
    `;

    tr.querySelector(".table-task-link").addEventListener("click", () => openResultsDrawer(task.id));
    tr.querySelector('[data-action="view-results"]').addEventListener("click", () => openResultsDrawer(task.id));
    tr.querySelector('[data-action="run-task"]').addEventListener("click", () => simulateWorkerRun(task.id));
    const signOffBtn = tr.querySelector('[data-action="sign-off"]');
    if (signOffBtn) {
      signOffBtn.addEventListener("click", () => openApprovalModal(task.id));
    }

    dom.matrixTableBody.appendChild(tr);
  });
}

// ============================================================================
// Directives Desk Renderer (Boardroom)
// ============================================================================
function renderDirectives() {
  if (!dom.directivesGrid) return;
  dom.directivesGrid.innerHTML = "";

  const directives = appState.getDirectives();
  if (directives.length === 0) {
    dom.directivesGrid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-dim); background: var(--bg-card); border-radius: var(--radius-md);">
        No strategic directives issued yet. Click "Dispatch Directive" to instruct the CEO Agent.
      </div>
    `;
    return;
  }

  directives.forEach(dir => {
    const card = document.createElement("div");
    card.className = "directive-card";

    // Calculate subtask completion
    const allTasks = appState.getAllTasks();
    const childTasks = allTasks.filter(t => dir.childTaskIds && dir.childTaskIds.includes(t.id));
    const doneCount = childTasks.filter(t => t.status === "done").length;
    const totalCount = childTasks.length;
    const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : (dir.status === "completed" ? 100 : 25);

    const statusBadge = dir.status === "completed"
      ? `<span class="badge badge-accent">Completed</span>`
      : `<span class="badge badge-warning">CEO Executing</span>`;

    card.innerHTML = `
      <div class="directive-card-header">
        <span class="directive-id-badge">${escapeHtml(dir.id)}</span>
        <div style="display:flex; gap:0.4rem; align-items:center;">
          <span class="priority-badge priority-${dir.priority}">${dir.priority}</span>
          ${statusBadge}
        </div>
      </div>
      <h3 class="directive-title">${escapeHtml(dir.title)}</h3>
      <p class="directive-desc">${escapeHtml(dir.context || "No context provided.")}</p>
      
      <div class="directive-progress-wrap">
        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted);">
          <span>Execution Progress</span>
          <span>${doneCount}/${totalCount} Sub-tasks (${pct}%)</span>
        </div>
        <div class="directive-progress-bar">
          <div class="directive-progress-fill" style="width: ${pct}%;"></div>
        </div>
      </div>

      ${dir.ceoReport ? `
        <div style="background:var(--bg-tertiary); padding:0.75rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle); font-size:0.78rem; color:var(--text-muted);">
          <strong style="color:var(--accent-cyan); display:block; margin-bottom:0.25rem;">Executive Briefing</strong>
          ${escapeHtml(dir.ceoReport)}
        </div>
      ` : ""}

      <div class="directive-meta-row">
        <span>Created: ${escapeHtml(dir.createdAt)}</span>
        <span>Budget: ${escapeHtml(dir.budgetAllocated)} • Spend: $${(dir.costUsd || 0).toFixed(2)}</span>
      </div>
    `;

    dom.directivesGrid.appendChild(card);
  });
}

// ============================================================================
// Approvals Desk Renderer (One-Way Doors Dedicated Queue)
// ============================================================================
function renderApprovalsDesk() {
  if (!dom.approvalsDeskGrid) return;
  dom.approvalsDeskGrid.innerHTML = "";

  const approvals = appState.getApprovals();
  if (approvals.length === 0) {
    dom.approvalsDeskGrid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 2.5rem; text-align: center; color: var(--text-dim); background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-medium);">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🛡️</div>
        <h3 style="color: var(--text-main); margin-bottom: 0.25rem;">No Pending One-Way Actions</h3>
        <p style="font-size: 0.85rem;">All autonomous agent tasks are executing within two-way reversible parameters.</p>
      </div>
    `;
    return;
  }

  approvals.forEach(task => {
    const card = document.createElement("div");
    card.className = "approval-card";

    const agent = task.worker || (task.ownerAgent ? task.ownerAgent.toUpperCase() : "CTO Agent");
    const blast = task.payload && task.payload.blastRadius ? task.payload.blastRadius : "Modifies repository or external systems";

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="task-id-badge">${escapeHtml(task.id)}</span>
        <span class="badge-one-way">⚠️ ONE-WAY DOOR</span>
      </div>
      <h3 style="font-size:1.05rem; font-weight:600; color:var(--text-main);">${escapeHtml(task.title)}</h3>
      <p style="font-size:0.82rem; color:var(--text-muted);">${escapeHtml(task.description || "")}</p>
      
      <div style="background:rgba(245, 158, 11, 0.1); border:1px solid rgba(245, 158, 11, 0.3); padding:0.65rem 0.85rem; border-radius:var(--radius-sm); font-size:0.75rem; color:#fbbf24;">
        <strong>Blast Radius:</strong> ${escapeHtml(blast)}
      </div>

      <div style="font-size:0.75rem; color:var(--text-dim); display:flex; justify-content:space-between;">
        <span>Agent: <strong>${escapeHtml(agent)}</strong></span>
        <span>Tokens: ${(task.tokensUsed || 0).toLocaleString()}</span>
      </div>

      <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
        <button type="button" class="btn btn-primary" style="flex:1;" data-action="open-modal">
          ✍️ Review &amp; Sign Off
        </button>
      </div>
    `;

    card.querySelector('[data-action="open-modal"]').addEventListener("click", () => {
      openApprovalModal(task.id);
    });

    dom.approvalsDeskGrid.appendChild(card);
  });
}

// ============================================================================
// Agent Roster Renderer (Org Topology)
// ============================================================================
function renderAgentRoster() {
  if (!dom.agentsGrid) return;
  dom.agentsGrid.innerHTML = "";

  appState.agents.forEach(agent => {
    const card = document.createElement("div");
    card.className = "agent-card";

    let statusClass = "text-muted";
    if (agent.status === "Reasoning" || agent.status === "Coding") statusClass = "text-warning";
    if (agent.status === "Auditing") statusClass = "text-accent";
    if (agent.status === "Idle") statusClass = "text-dim";

    const toolsHtml = agent.tools
      .map(tool => `<span class="tool-tag">${escapeHtml(tool)}</span>`)
      .join("");

    card.innerHTML = `
      <div class="agent-card-header">
        <div class="agent-avatar">${agent.avatar}</div>
        <div>
          <h4 class="agent-name">${escapeHtml(agent.name)}</h4>
          <p class="agent-role">${escapeHtml(agent.role)}</p>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; font-size:0.75rem; padding:0.5rem 0; border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle);">
        <span>Reports to: <strong style="color:var(--text-main);">${escapeHtml(agent.reportsTo)}</strong></span>
        <span>Status: <strong class="${statusClass}">● ${escapeHtml(agent.status)}</strong></span>
      </div>

      <div style="font-size:0.75rem; color:var(--text-dim);">
        <div style="margin-bottom:0.25rem;">Active Task / Lease:</div>
        <div style="font-family:var(--font-mono); color:var(--text-muted); background:var(--bg-tertiary); padding:0.35rem 0.5rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
          ${escapeHtml(agent.activeTask)}
        </div>
      </div>

      <div style="font-size:0.75rem;">
        <span style="color:var(--text-dim); display:block; margin-bottom:0.3rem;">Authorized System Tools:</span>
        <div class="agent-tools-list">${toolsHtml}</div>
      </div>

      <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--text-dim); margin-top:auto; padding-top:0.5rem;">
        <span>Daily Budget: ${escapeHtml(agent.budget)}</span>
        <span>Tokens: ${(agent.tokensUsed || 0).toLocaleString()}</span>
      </div>
    `;

    dom.agentsGrid.appendChild(card);
  });
}

function renderAll() {
  renderMetrics();
  updateWorkerFilterOptions();

  // Hide all sections first
  dom.kanbanBoard.classList.add("hidden");
  dom.tableViewContainer.classList.add("hidden");
  dom.approvalsSection.classList.add("hidden");
  dom.directivesSection.classList.add("hidden");
  dom.agentsSection.classList.add("hidden");

  // Show active view
  if (appState.currentView === "kanban") {
    dom.kanbanBoard.classList.remove("hidden");
    renderKanban();
  } else if (appState.currentView === "table") {
    dom.tableViewContainer.classList.remove("hidden");
    renderTableView();
  } else if (appState.currentView === "approvals") {
    dom.approvalsSection.classList.remove("hidden");
    renderApprovalsDesk();
  } else if (appState.currentView === "directives") {
    dom.directivesSection.classList.remove("hidden");
    renderDirectives();
  } else if (appState.currentView === "agents") {
    dom.agentsSection.classList.remove("hidden");
    renderAgentRoster();
  }
}

// ============================================================================
// One-Way Door Approval Modal Logic
// ============================================================================
function openApprovalModal(taskId) {
  const task = appState.getTaskById(taskId);
  if (!task) return;

  currentApprovalTaskId = taskId;
  dom.approvalTaskId.textContent = task.id;
  dom.approvalActionName.textContent = task.title;
  dom.approvalRequestingAgent.textContent = task.worker || (task.ownerAgent ? task.ownerAgent.toUpperCase() : "CTO Agent");

  const tokens = task.tokensUsed ? `${(task.tokensUsed / 1000).toFixed(1)}k (~$${(task.costUsd || 0).toFixed(2)})` : "16.4k (~$0.33)";
  dom.approvalTokenCost.textContent = tokens;

  if (task.payload && task.payload.blastRadius) {
    dom.approvalBlastRadiusDesc.textContent = task.payload.blastRadius;
  } else {
    dom.approvalBlastRadiusDesc.textContent = "This action modifies external state, merges code to production, or spends funds. Execution is paused.";
  }

  // Acceptance criteria list
  dom.approvalCriteriaList.innerHTML = "";
  const criteria = task.acceptanceCriteria || [
    "Reviewer Agent verified against security standards",
    "Test suite completed cleanly (Exit 0)",
    "One-Way Door explicit Chairman authorization"
  ];

  criteria.forEach(item => {
    const div = document.createElement("div");
    div.className = "criteria-item";
    div.innerHTML = `
      <input type="checkbox" checked disabled>
      <span>${escapeHtml(item)}</span>
    `;
    dom.approvalCriteriaList.appendChild(div);
  });

  // Diff / Payload preview
  const payloadStr = JSON.stringify(task.payload || task.result || {}, null, 2);
  dom.approvalPayloadDiff.textContent = payloadStr;
  dom.inputApprovalNotes.value = "";

  dom.approvalModal.showModal();
}

// ============================================================================
// Directives Modal Logic
// ============================================================================
function openDirectiveModal() {
  dom.inputDirectiveTitle.value = "";
  dom.selectDirectivePriority.value = "high";
  dom.inputDirectiveBudget.value = "$5.00";
  dom.inputDirectiveContext.value = "";
  dom.directiveModal.showModal();
}

function handleDirectiveFormSubmit(e) {
  e.preventDefault();
  const title = dom.inputDirectiveTitle.value.trim();
  if (!title) return;

  const newDir = appState.addDirective({
    title,
    priority: dom.selectDirectivePriority.value,
    budgetAllocated: dom.inputDirectiveBudget.value.trim() || "$5.00",
    context: dom.inputDirectiveContext.value.trim()
  });

  dom.directiveModal.close();

  // Simulate CEO breaking it down into 2 initial tasks
  setTimeout(() => {
    const taskA = appState.addTask({
      title: `Plan & Spec: ${title}`,
      description: `CEO & CTO technical decomposition for directive ${newDir.id}`,
      door: "two_way",
      ownerAgent: "cto",
      worker: "CTO Agent",
      directiveId: newDir.id,
      priority: newDir.priority,
      tags: ["spec", "architecture"]
    });
    newDir.childTaskIds.push(taskA.id);
    appState.saveDirectives();
    renderAll();
    showToast(`CEO Agent processed ${newDir.id} and created ${taskA.id}`, "success");
  }, 1200);

  renderAll();
  showToast(`Dispatched Directive ${newDir.id} to CEO Agent`, "success");
}

// ============================================================================
// Results Inspector Drawer Logic
// ============================================================================
function openResultsDrawer(taskId) {
  const task = appState.getTaskById(taskId);
  if (!task) return;

  appState.activeTaskId = taskId;

  // Header info
  dom.drawerTaskId.textContent = task.id;
  dom.drawerTaskTitle.textContent = task.title;
  dom.drawerTaskDesc.textContent = task.description || "No description provided.";
  dom.drawerStatusPill.textContent = task.status;
  dom.drawerStatusPill.className = `status-pill status-${task.status}`;

  // Metrics and result
  if (task.result) {
    const resStatus = task.result.status || "none";
    dom.drawerResultBadge.textContent = resStatus.toUpperCase();
    dom.drawerResultBadge.className = `result-badge ${resStatus}`;
    dom.statDuration.textContent = task.result.duration || "—";
    dom.statWorker.textContent = task.worker || (task.ownerAgent ? task.ownerAgent.toUpperCase() : "—");
    dom.statRecords.textContent = task.result.recordsCount !== undefined ? `${task.result.recordsCount} items` : "—";
    dom.statExitCode.textContent = `Exit ${task.result.exitCode ?? 0} • ${task.result.memoryUsage || "Normal"}`;

    const jsonStr = JSON.stringify(task.result.data || task.result, null, 2);
    dom.artifactJsonContent.textContent = jsonStr;
    renderTerminalLogs(task.result.logs || []);
    renderResourceLinks(task.result.links || []);
  } else {
    dom.drawerResultBadge.textContent = "QUEUED";
    dom.drawerResultBadge.className = "result-badge none";
    dom.statDuration.textContent = "—";
    dom.statWorker.textContent = task.worker || "—";
    dom.statRecords.textContent = "0 items";
    dom.statExitCode.textContent = "Exit —";

    dom.artifactJsonContent.textContent = "// No output data generated yet.\n// Click 'Run Worker Now' or attach results.";
    renderTerminalLogs([
      `[${new Date().toLocaleTimeString()}] [system] Task initialized in ${task.status} state`,
      `[${new Date().toLocaleTimeString()}] [system] Waiting for agent dispatch...`
    ]);
    renderResourceLinks([]);
  }

  // Parameters
  const payloadStr = JSON.stringify(task.payload || {}, null, 2);
  dom.taskPayloadContent.textContent = payloadStr;

  // Open drawer
  dom.drawer.classList.add("open");
  dom.drawerBackdrop.classList.add("open");
}

function closeResultsDrawer() {
  dom.drawer.classList.remove("open");
  dom.drawerBackdrop.classList.remove("open");
  appState.activeTaskId = null;
}

function renderTerminalLogs(logs) {
  dom.terminalLogs.innerHTML = "";
  if (!logs || logs.length === 0) {
    dom.terminalLogs.innerHTML = `<div class="terminal-line"><span class="log-dim">[system]</span> No log records found.</div>`;
    return;
  }

  logs.forEach(line => {
    const el = document.createElement("div");
    el.className = "terminal-line";

    let colorClass = "log-info";
    if (line.includes("[ERROR]") || line.includes("failed")) colorClass = "log-error";
    if (line.includes("[WARN]")) colorClass = "log-warn";
    if (line.includes("[SUCCESS]")) colorClass = "log-success";
    if (line.includes("[CHAIRMAN")) colorClass = "log-warn";

    el.innerHTML = `<span class="${colorClass}">${escapeHtml(line)}</span>`;
    dom.terminalLogs.appendChild(el);
  });

  dom.terminalLogs.scrollTop = dom.terminalLogs.scrollHeight;
}

function renderResourceLinks(links) {
  dom.resourcesList.innerHTML = "";
  if (!links || links.length === 0) {
    dom.resourcesList.innerHTML = `<li class="empty-list-msg">No external artifacts linked yet.</li>`;
    return;
  }

  links.forEach(l => {
    const li = document.createElement("li");
    li.className = "resource-item";
    li.innerHTML = `
      <div class="resource-info">
        <span class="resource-label">${escapeHtml(l.label)}</span>
        <span class="resource-url">${escapeHtml(l.url)}</span>
      </div>
      <a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-ghost">Open ↗</a>
    `;
    dom.resourcesList.appendChild(li);
  });
}

// ============================================================================
// Task Modal Logic (Create & Edit)
// ============================================================================
function openTaskModal(taskId = null, defaultStatus = "backlog") {
  dom.taskForm.reset();
  dom.taskFormId.value = taskId || "";

  // Populate directives dropdown
  dom.selectTaskDirective.innerHTML = '<option value="">None (Independent Task)</option>';
  appState.getDirectives().forEach(dir => {
    const opt = document.createElement("option");
    opt.value = dir.id;
    opt.textContent = `${dir.id}: ${dir.title}`;
    dom.selectTaskDirective.appendChild(opt);
  });

  if (taskId) {
    const task = appState.getTaskById(taskId);
    if (!task) return;

    dom.modalTaskTitle.textContent = `Edit Task ${task.id}`;
    dom.inputTaskTitle.value = task.title;
    dom.selectTaskStatus.value = task.status;
    dom.selectTaskDoor.value = task.door || "two_way";
    dom.selectTaskAgent.value = task.ownerAgent || "cto";
    dom.selectTaskPriority.value = task.priority;
    dom.selectTaskDirective.value = task.directiveId || "";
    dom.inputTaskTags.value = (task.tags || []).join(", ");
    dom.inputTaskDesc.value = task.description || "";
    dom.inputTaskCriteria.value = (task.acceptanceCriteria || []).join("\n");
    dom.inputTaskPayload.value = JSON.stringify(task.payload || {}, null, 2);
  } else {
    dom.modalTaskTitle.textContent = "Create New Task";
    dom.selectTaskStatus.value = defaultStatus;
    dom.selectTaskDoor.value = "two_way";
    dom.selectTaskAgent.value = "cto";
    dom.selectTaskPriority.value = "medium";
    dom.inputTaskPayload.value = '{\n  "budgetTokens": 20000\n}';
  }

  dom.taskModal.showModal();
}

function handleTaskFormSubmit(e) {
  e.preventDefault();
  const id = dom.taskFormId.value;
  const title = dom.inputTaskTitle.value.trim();
  if (!title) return;

  let payload = {};
  try {
    const raw = dom.inputTaskPayload.value.trim();
    if (raw) payload = JSON.parse(raw);
  } catch (err) {
    showToast("Invalid JSON in Task Payload: " + err.message, "danger");
    return;
  }

  const tags = dom.inputTaskTags.value
    .split(",")
    .map(s => s.trim().replace(/^#/, ""))
    .filter(Boolean);

  const criteria = dom.inputTaskCriteria.value
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);

  const agentVal = dom.selectTaskAgent.value;
  let workerName = "CTO Agent";
  if (agentVal === "ceo") workerName = "CEO Agent";
  if (agentVal === "dev-1") workerName = "Dev Worker 01";
  if (agentVal === "dev-2") workerName = "Dev Worker 02";
  if (agentVal === "reviewer") workerName = "Reviewer Agent";

  const taskData = {
    title,
    description: dom.inputTaskDesc.value.trim(),
    status: dom.selectTaskStatus.value,
    door: dom.selectTaskDoor.value,
    ownerAgent: agentVal,
    worker: workerName,
    priority: dom.selectTaskPriority.value,
    directiveId: dom.selectTaskDirective.value || null,
    tags,
    acceptanceCriteria: criteria,
    payload
  };

  if (id) {
    appState.updateTask(id, taskData);
    showToast(`Updated task ${id}`, "success");
    if (appState.activeTaskId === id) openResultsDrawer(id);
  } else {
    const newTask = appState.addTask(taskData);
    showToast(`Created task ${newTask.id}`, "success");
  }

  dom.taskModal.close();
  renderAll();
}

// Result Modal Logic
function openResultModal(taskId) {
  const task = appState.getTaskById(taskId);
  if (!task) return;

  dom.resultFormTaskId.value = taskId;
  if (task.result) {
    dom.selectResultStatus.value = task.result.status || "success";
    dom.inputResultDuration.value = task.result.duration || "1.82s";
    dom.inputResultSummary.value = task.result.summary || "";
    dom.inputResultExitCode.value = task.result.exitCode ?? 0;
    dom.inputResultJson.value = JSON.stringify(task.result.data || {}, null, 2);
    dom.inputResultLogs.value = (task.result.logs || []).join("\n");
  } else {
    dom.selectResultStatus.value = "success";
    dom.inputResultDuration.value = "1.82s";
    dom.inputResultSummary.value = "Execution verified cleanly";
    dom.inputResultExitCode.value = "0";
    dom.inputResultJson.value = '{\n  "status": "completed"\n}';
    dom.inputResultLogs.value = "[INFO] Agent session booted\n[SUCCESS] Task completed cleanly.";
  }

  dom.resultModal.showModal();
}

function handleResultFormSubmit(e) {
  e.preventDefault();
  const id = dom.resultFormTaskId.value;
  if (!id) return;

  let jsonData = {};
  try {
    const raw = dom.inputResultJson.value.trim();
    if (raw) jsonData = JSON.parse(raw);
  } catch (err) {
    showToast("Invalid JSON in Result Data: " + err.message, "danger");
    return;
  }

  const logs = dom.inputResultLogs.value
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);

  const status = dom.selectResultStatus.value;
  const resultData = {
    status,
    duration: dom.inputResultDuration.value.trim() || "1.5s",
    summary: dom.inputResultSummary.value.trim() || "Manual result attached",
    exitCode: parseInt(dom.inputResultExitCode.value.trim(), 10) || 0,
    recordsCount: 1,
    memoryUsage: "48MB",
    executedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
    data: jsonData,
    logs,
    links: []
  };

  appState.attachResult(id, resultData);
  if (status === "success") appState.updateTaskStatus(id, "done");
  if (status === "failure") appState.updateTaskStatus(id, "failed");

  dom.resultModal.close();
  renderAll();
  if (appState.activeTaskId === id) openResultsDrawer(id);
  showToast(`Attached result to ${id}`, "success");
}

// Link Modal Logic
function openLinkModal() {
  dom.linkForm.reset();
  dom.linkModal.showModal();
}

function handleLinkFormSubmit(e) {
  e.preventDefault();
  const taskId = appState.activeTaskId;
  if (!taskId) return;

  const label = dom.inputLinkLabel.value.trim();
  const url = dom.inputLinkUrl.value.trim();
  if (!label || !url) return;

  const task = appState.getTaskById(taskId);
  if (!task) return;

  if (!task.result) {
    task.result = {
      status: "partial",
      duration: "—",
      summary: "External resource attached",
      logs: [],
      links: []
    };
  }

  task.result.links = task.result.links || [];
  task.result.links.push({ label, url });
  appState.saveTasks();

  dom.linkModal.close();
  renderResourceLinks(task.result.links);
  showToast("Linked external artifact", "success");
}

// ============================================================================
// Multi-Agent Simulation Engine
// ============================================================================
function simulateWorkerRun(taskId) {
  if (appState.killSwitchActive) {
    showToast("⚠️ Global Kill Switch Active: System is frozen. Deactivate to run.", "warning");
    return;
  }

  const task = appState.getTaskById(taskId);
  if (!task) return;

  appState.updateTaskStatus(taskId, "running");
  renderAll();
  showToast(`⚡ Dispatched ${task.id} to ${task.worker || "Agent"}...`, "info");

  const isOneWay = (task.door === "one_way");
  const isFailChance = Math.random() < 0.15; // 15% random failure rate

  setTimeout(() => {
    if (appState.killSwitchActive) {
      showToast(`Task ${taskId} halted mid-execution by Kill Switch.`, "warning");
      return;
    }

    const duration = (Math.random() * 2 + 1).toFixed(2) + "s";
    const ts = new Date().toLocaleTimeString();

    if (isFailChance && !isOneWay) {
      // Simulate failure
      task.status = "failed";
      task.tokensUsed = (task.tokensUsed || 0) + 4200;
      task.costUsd = (task.costUsd || 0) + 0.08;
      task.result = {
        status: "failure",
        exitCode: 1,
        duration,
        summary: "Unit test assertion failed: Error on mock dependency timeout",
        recordsCount: 0,
        memoryUsage: "52MB",
        executedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
        data: { error: "AssertionError: Expected Exit 0 but got 1", attempt: 1 },
        logs: [
          `[${ts}] [INFO] Container booted for ${task.worker}`,
          `[${ts}] [INFO] Running automated test suite...`,
          `[${ts}] [ERROR] AssertionError on test_security_invariants()`,
          `[${ts}] [ERROR] Task failed. Escalation recorded.`
        ],
        links: []
      };
      appState.saveTasks();
      renderAll();
      showToast(`❌ Task ${taskId} failed verification`, "danger");
      if (appState.activeTaskId === taskId) openResultsDrawer(taskId);
      return;
    }

    if (isOneWay) {
      // One-Way Door: Complete implementation, then HALT at approval gate
      task.status = "approval_pending";
      task.tokensUsed = (task.tokensUsed || 0) + 12800;
      task.costUsd = (task.costUsd || 0) + 0.26;
      task.result = {
        status: "partial",
        exitCode: "PAUSED",
        duration,
        summary: "Work complete. Halted at One-Way Door Gate: Awaiting Chairman sign-off.",
        recordsCount: 1,
        memoryUsage: "64MB",
        executedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
        data: {
          action: task.title,
          testsPassed: true,
          criteriaScore: "100%",
          gateType: "ONE_WAY_DOOR"
        },
        logs: [
          `[${ts}] [INFO] ${task.worker} executed implementation in worktree`,
          `[${ts}] [INFO] Reviewer Agent: Acceptance criteria verified. Tests exit 0.`,
          `[${ts}] [WARN] Irreversible action detected (One-Way Door).`,
          `[${ts}] [WARN] Execution halted. Transferred to Chairman Approvals Desk.`
        ],
        links: []
      };
      appState.saveTasks();
      renderAll();
      showToast(`⚠️ Action halted: ${task.id} requires Chairman One-Way sign-off!`, "warning");
      if (appState.activeTaskId === taskId) openResultsDrawer(taskId);
      return;
    }

    // Standard Two-Way Task: Completed autonomously
    task.status = "done";
    task.tokensUsed = (task.tokensUsed || 0) + 9400;
    task.costUsd = (task.costUsd || 0) + 0.19;
    task.result = {
      status: "success",
      exitCode: 0,
      duration,
      summary: "Autonomous 2-Way execution completed cleanly (Exit 0)",
      recordsCount: 1,
      memoryUsage: "48MB",
      executedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
      data: {
        completed: true,
        verificationStatus: "Verified 2-Way Reversible",
        exitCode: 0
      },
      logs: [
        `[${ts}] [INFO] Worker container booted for ${task.worker}`,
        `[${ts}] [INFO] Reversible 2-Way action executed`,
        `[${ts}] [SUCCESS] Acceptance criteria verified. Status: Done.`
      ],
      links: []
    };
    appState.saveTasks();
    renderAll();
    showToast(`✅ Finished task ${task.id} cleanly`, "success");
    if (appState.activeTaskId === taskId) openResultsDrawer(taskId);
  }, 1600);
}

function simulateRunAllQueued() {
  if (appState.killSwitchActive) {
    showToast("⚠️ Kill Switch Active: Deactivate to execute queued tasks.", "warning");
    return;
  }

  const queued = appState.getAllTasks().filter(t => t.status === "backlog");
  if (queued.length === 0) {
    showToast("No queued tasks to run.", "info");
    return;
  }

  showToast(`Dispatching ${queued.length} queued tasks to agent pool...`, "info");
  queued.forEach((task, idx) => {
    setTimeout(() => {
      simulateWorkerRun(task.id);
    }, idx * 600);
  });
}

// ============================================================================
// HTML5 Drag and Drop Handlers
// ============================================================================
let draggedTaskId = null;

function handleDragStart(e) {
  draggedTaskId = this.dataset.taskId;
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", draggedTaskId);
}

function handleDragEnd() {
  this.classList.remove("dragging");
  draggedTaskId = null;
  document.querySelectorAll(".kanban-column").forEach(col => col.classList.remove("drag-over"));
}

function setupKanbanDropZones() {
  document.querySelectorAll(".kanban-column").forEach(col => {
    col.addEventListener("dragover", e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      col.classList.add("drag-over");
    });

    col.addEventListener("dragleave", () => {
      col.classList.remove("drag-over");
    });

    col.addEventListener("drop", e => {
      e.preventDefault();
      col.classList.remove("drag-over");
      const targetStatus = col.dataset.status;
      if (draggedTaskId && targetStatus) {
        const task = appState.getTaskById(draggedTaskId);
        if (task && task.status !== targetStatus) {
          appState.updateTaskStatus(draggedTaskId, targetStatus);
          renderAll();
          showToast(`Moved ${draggedTaskId} to ${targetStatus}`, "info");
        }
      }
    });
  });
}

// ============================================================================
// Event Listeners & Initialization
// ============================================================================
function setupEventListeners() {
  // Search & Filtering
  dom.searchInput.addEventListener("input", e => {
    appState.searchQuery = e.target.value.trim();
    if (appState.searchQuery) {
      dom.clearSearch.classList.remove("hidden");
    } else {
      dom.clearSearch.classList.add("hidden");
    }
    renderAll();
  });

  dom.clearSearch.addEventListener("click", () => {
    dom.searchInput.value = "";
    appState.searchQuery = "";
    dom.clearSearch.classList.add("hidden");
    renderAll();
  });

  dom.filterPriority.addEventListener("change", e => {
    appState.filters.priority = e.target.value;
    renderAll();
  });

  if (dom.filterDoor) {
    dom.filterDoor.addEventListener("change", e => {
      appState.filters.door = e.target.value;
      renderAll();
    });
  }

  dom.filterWorker.addEventListener("change", e => {
    appState.filters.worker = e.target.value;
    renderAll();
  });

  dom.filterResult.addEventListener("change", e => {
    appState.filters.result = e.target.value;
    renderAll();
  });

  // View Switchers
  const resetViewButtons = () => {
    [dom.viewKanbanBtn, dom.viewApprovalsBtn, dom.viewDirectivesBtn, dom.viewAgentsBtn, dom.viewTableBtn]
      .filter(Boolean)
      .forEach(btn => btn.classList.remove("active"));
  };

  dom.viewKanbanBtn.addEventListener("click", () => {
    appState.currentView = "kanban";
    resetViewButtons();
    dom.viewKanbanBtn.classList.add("active");
    renderAll();
  });

  dom.viewTableBtn.addEventListener("click", () => {
    appState.currentView = "table";
    resetViewButtons();
    dom.viewTableBtn.classList.add("active");
    renderAll();
  });

  if (dom.viewApprovalsBtn) {
    dom.viewApprovalsBtn.addEventListener("click", () => {
      appState.currentView = "approvals";
      resetViewButtons();
      dom.viewApprovalsBtn.classList.add("active");
      renderAll();
    });
  }

  if (dom.viewDirectivesBtn) {
    dom.viewDirectivesBtn.addEventListener("click", () => {
      appState.currentView = "directives";
      resetViewButtons();
      dom.viewDirectivesBtn.classList.add("active");
      renderAll();
    });
  }

  if (dom.viewAgentsBtn) {
    dom.viewAgentsBtn.addEventListener("click", () => {
      appState.currentView = "agents";
      resetViewButtons();
      dom.viewAgentsBtn.classList.add("active");
      renderAll();
    });
  }

  // Header Actions
  dom.btnNewTask.addEventListener("click", () => openTaskModal(null, "backlog"));
  if (dom.btnNewDirective) {
    dom.btnNewDirective.addEventListener("click", openDirectiveModal);
  }
  if (dom.btnOpenDirectiveFormModal) {
    dom.btnOpenDirectiveFormModal.addEventListener("click", openDirectiveModal);
  }

  dom.btnSimulateAll.addEventListener("click", simulateRunAllQueued);

  // Kill Switch
  dom.btnKillSwitch.addEventListener("click", () => {
    const isFrozen = appState.toggleKillSwitch();
    if (isFrozen) {
      dom.btnKillSwitch.classList.add("active");
      dom.killSwitchText.textContent = "SYSTEM FROZEN";
      showToast("🚨 EMERGENCY KILL SWITCH ENGAGED: All agent processes halted.", "danger");
    } else {
      dom.btnKillSwitch.classList.remove("active");
      dom.killSwitchText.textContent = "Kill Switch";
      showToast("🟢 Kill Switch Disengaged: Normal agent orchestration resumed.", "success");
    }
  });

  // Reset Demo (uses showToast instead of browser confirm)
  dom.btnResetDemo.addEventListener("click", () => {
    appState.resetToDefault();
    renderAll();
    showToast("Dashboard reset to corporate demo baseline", "success");
  });

  // Column Quick Add Buttons
  document.querySelectorAll(".btn-add-column-task").forEach(btn => {
    btn.addEventListener("click", () => {
      const status = btn.dataset.addStatus || "backlog";
      openTaskModal(null, status);
    });
  });

  // Drawer Interactions
  dom.btnCloseDrawer.addEventListener("click", closeResultsDrawer);
  dom.drawerBackdrop.addEventListener("click", closeResultsDrawer);

  document.querySelectorAll(".drawer-tabs .tab-btn").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".drawer-tabs .tab-btn").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

      tab.classList.add("active");
      const targetId = tab.dataset.tab;
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.classList.add("active");
    });
  });

  dom.btnSimulateTask.addEventListener("click", () => {
    if (appState.activeTaskId) simulateWorkerRun(appState.activeTaskId);
  });

  dom.btnEditTaskFromDrawer.addEventListener("click", () => {
    if (appState.activeTaskId) openTaskModal(appState.activeTaskId);
  });

  dom.btnAddResultManual.addEventListener("click", () => {
    if (appState.activeTaskId) openResultModal(appState.activeTaskId);
  });

  dom.btnDeleteTask.addEventListener("click", () => {
    if (!appState.activeTaskId) return;
    const id = appState.activeTaskId;
    closeResultsDrawer();
    appState.deleteTask(id);
    renderAll();
    showToast(`Deleted task ${id}`, "danger");
  });

  dom.btnCopyResultJson.addEventListener("click", () => {
    const text = dom.artifactJsonContent.textContent;
    navigator.clipboard.writeText(text).then(() => {
      showToast("Copied JSON payload to clipboard", "success");
    });
  });

  dom.btnDownloadResult.addEventListener("click", () => {
    const text = dom.artifactJsonContent.textContent;
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${appState.activeTaskId || "task"}_result.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded result JSON", "success");
  });

  dom.btnCopyLogs.addEventListener("click", () => {
    const text = dom.terminalLogs.innerText;
    navigator.clipboard.writeText(text).then(() => {
      showToast("Execution logs copied to clipboard", "success");
    });
  });

  dom.btnAddExternalLink.addEventListener("click", openLinkModal);

  // Form Submissions
  dom.taskForm.addEventListener("submit", handleTaskFormSubmit);
  dom.btnCloseTaskModal.addEventListener("click", () => dom.taskModal.close());
  dom.btnCancelTaskModal.addEventListener("click", () => dom.taskModal.close());

  dom.directiveForm.addEventListener("submit", handleDirectiveFormSubmit);
  dom.btnCloseDirectiveModal.addEventListener("click", () => dom.directiveModal.close());
  dom.btnCancelDirectiveModal.addEventListener("click", () => dom.directiveModal.close());

  // One-Way Door Approval Decisions
  dom.btnApproveAction.addEventListener("click", () => {
    if (!currentApprovalTaskId) return;
    const notes = dom.inputApprovalNotes.value.trim();
    appState.approveOneWayTask(currentApprovalTaskId, notes);
    dom.approvalModal.close();
    renderAll();
    showToast(`✅ One-Way Action Approved for ${currentApprovalTaskId}!`, "success");
  });

  dom.btnReviseApproval.addEventListener("click", () => {
    if (!currentApprovalTaskId) return;
    const feedback = dom.inputApprovalNotes.value.trim() || "Please revise acceptance tests";
    appState.reviseOneWayTask(currentApprovalTaskId, feedback);
    dom.approvalModal.close();
    renderAll();
    showToast(`Returned ${currentApprovalTaskId} for revision`, "warning");
  });

  dom.btnRejectApproval.addEventListener("click", () => {
    if (!currentApprovalTaskId) return;
    const reason = dom.inputApprovalNotes.value.trim() || "Rejected by Chairman";
    appState.rejectOneWayTask(currentApprovalTaskId, reason);
    dom.approvalModal.close();
    renderAll();
    showToast(`❌ One-Way Door Rejected for ${currentApprovalTaskId}`, "danger");
  });

  dom.btnCloseApprovalModal.addEventListener("click", () => dom.approvalModal.close());
  dom.btnCancelApprovalModal.addEventListener("click", () => dom.approvalModal.close());

  dom.resultForm.addEventListener("submit", handleResultFormSubmit);
  dom.btnCloseResultModal.addEventListener("click", () => dom.resultModal.close());
  dom.btnCancelResultModal.addEventListener("click", () => dom.resultModal.close());

  dom.linkForm.addEventListener("submit", handleLinkFormSubmit);
  dom.btnCloseLinkModal.addEventListener("click", () => dom.linkModal.close());
  dom.btnCancelLinkModal.addEventListener("click", () => dom.linkModal.close());

  // Escape key closes drawer
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && dom.drawer.classList.contains("open")) {
      closeResultsDrawer();
    }
  });

  setupKanbanDropZones();
}

// App Initialization
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  renderAll();
});
