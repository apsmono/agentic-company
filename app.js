/**
 * WorkerFlow - Task & Execution Results Dashboard
 * Pure Vanilla JavaScript implementation with state management,
 * HTML5 drag-and-drop, interactive drawer inspector, and worker simulator.
 */

// ============================================================================
// Sample Initial Data (Realistic Worker & Automation Pipelines)
// ============================================================================
const DEFAULT_TASKS = [
  {
    id: "TASK-101",
    title: "E-Commerce Price Scraper (Amazon & Target)",
    description: "Daily automated extraction of competitor pricing for top 1,500 retail SKUs.",
    status: "done",
    priority: "high",
    worker: "crawler-engine-eu-west",
    tags: ["scraping", "retail", "cron"],
    createdAt: "2026-10-01 08:30",
    payload: {
      targetCategories: ["Electronics", "Home & Kitchen"],
      maxPages: 80,
      currency: "USD",
      concurrency: 8
    },
    result: {
      status: "success",
      exitCode: 0,
      duration: "2.42s",
      summary: "Processed 1,420 SKUs cleanly, 0 timeouts",
      recordsCount: 1420,
      memoryUsage: "128MB",
      executedAt: "2026-10-01 08:32:42",
      data: {
        totalScraped: 1420,
        priceChangesDetected: 147,
        avgDiscount: "8.4%",
        lowestPriceVarianceSku: "SKU-99420-X",
        storageDestination: "s3://automation-worker-data/scrapes/2026-10-01/"
      },
      logs: [
        "[08:30:00] [INFO] Worker container spawned on node crawler-engine-eu-west",
        "[08:30:02] [INFO] Loaded proxies from pool: 45 healthy proxies",
        "[08:30:04] [INFO] Starting parallel crawl with 8 workers...",
        "[08:31:15] [INFO] Batch 1/3 finished: 500 items extracted",
        "[08:32:01] [INFO] Batch 2/3 finished: 500 items extracted",
        "[08:32:40] [INFO] Batch 3/3 finished: 420 items extracted",
        "[08:32:41] [SUCCESS] All target pages indexed without IP rate-limiting",
        "[08:32:42] [SUCCESS] Output archived to s3 bucket (Exit code 0)"
      ],
      links: [
        { label: "S3 Raw Output Parquet", url: "https://s3.amazonaws.com/automation-worker-data/scrapes/2026-10-01/prices.parquet" },
        { label: "CloudWatch Execution Metric", url: "https://console.aws.amazon.com/cloudwatch/logs/worker-task-101" }
      ]
    }
  },
  {
    id: "TASK-102",
    title: "LLM Batch Embeddings & Semantic Indexing",
    description: "Generate 1536-dim vector embeddings for newly ingested legal contracts.",
    status: "running",
    priority: "urgent",
    worker: "worker-gpu-cluster-02",
    tags: ["ml-pipeline", "embeddings", "gpu"],
    createdAt: "2026-10-01 09:15",
    payload: {
      model: "text-embedding-3-large",
      batchSize: 256,
      quantization: "fp16",
      indexTarget: "qdrant-cluster-prod"
    },
    result: {
      status: "running",
      exitCode: "—",
      duration: "41.5s",
      summary: "In progress: 540 / 1,200 contracts embedded",
      recordsCount: 540,
      memoryUsage: "6.2GB VRAM",
      executedAt: "2026-10-01 09:15:10",
      data: {
        totalToEmbed: 1200,
        processed: 540,
        gpuUtilization: "89%",
        throughputTokensSec: 14200
      },
      logs: [
        "[09:15:10] [INFO] Allocating TensorRT runner on NVIDIA A10G...",
        "[09:15:14] [INFO] Model weights verified (SHA256 valid)",
        "[09:15:20] [INFO] Processing chunk 1: vectors [0..255]",
        "[09:15:35] [INFO] Processing chunk 2: vectors [256..511]",
        "[09:15:51] [INFO] Currently indexing chunk 3 into vector database..."
      ],
      links: [
        { label: "GPU TensorBoard Metrics", url: "https://gpu-monitor.internal.net/runs/TASK-102" }
      ]
    }
  },
  {
    id: "TASK-103",
    title: "Daily Financial Reconciliation & Tax Audit",
    description: "Match Stripe settlement records against internal order ledger.",
    status: "review",
    priority: "urgent",
    worker: "analytics-processor-04",
    tags: ["finance", "audit", "compliance"],
    createdAt: "2026-10-01 06:00",
    payload: {
      reconciliationDate: "2026-09-30",
      currencies: ["USD", "EUR", "GBP"],
      toleranceThresholdCents: 5
    },
    result: {
      status: "partial",
      exitCode: 2,
      duration: "4.12s",
      summary: "Completed with 2 micro-discrepancies needing signoff",
      recordsCount: 3840,
      memoryUsage: "210MB",
      executedAt: "2026-10-01 06:04:12",
      data: {
        totalTransactions: 3840,
        matchedCleanly: 3838,
        flaggedVariances: 2,
        netMismatchUSD: "$0.08",
        statusMessage: "Requires human finance verification before ledger lock"
      },
      logs: [
        "[06:00:01] [INFO] Fetching daily Stripe settlement report...",
        "[06:00:05] [INFO] Ingesting database ledger snapshots...",
        "[06:02:18] [INFO] Running dual-entry hash match algorithm...",
        "[06:04:10] [WARN] Transaction #TX-9021 mismatch: fee offset of $0.04",
        "[06:04:11] [WARN] Transaction #TX-9044 mismatch: currency rounding of $0.04",
        "[06:04:12] [WARN] Audit finished with 2 warnings. Status: Pending Signoff."
      ],
      links: [
        { label: "Audit Discrepancy Sheet", url: "https://audit.internal.net/reports/2026-09-30-discrepancies" }
      ]
    }
  },
  {
    id: "TASK-104",
    title: "Customer Onboarding Webhook Dispatcher",
    description: "Deliver welcome payloads to newly registered partner API endpoints.",
    status: "failed",
    priority: "medium",
    worker: "edge-notifier-service",
    tags: ["webhooks", "delivery", "network"],
    createdAt: "2026-10-01 07:45",
    payload: {
      endpointUrl: "https://api.partner-client.io/v1/webhooks",
      timeoutSeconds: 5,
      retries: 3
    },
    result: {
      status: "failure",
      exitCode: 504,
      duration: "15.02s",
      summary: "HTTP 504 Gateway Timeout from remote destination",
      recordsCount: 0,
      memoryUsage: "45MB",
      executedAt: "2026-10-01 07:45:15",
      data: {
        httpStatus: 504,
        errorType: "GatewayTimeout",
        destinationHost: "api.partner-client.io",
        attemptsExhausted: 3
      },
      logs: [
        "[07:45:00] [INFO] Dispatching webhook payload for user_id=usr_88319...",
        "[07:45:05] [WARN] Attempt 1 failed: Connection timeout after 5000ms",
        "[07:45:10] [WARN] Attempt 2 failed: Gateway timeout (504)",
        "[07:45:15] [ERROR] Attempt 3 failed: Remote server did not respond",
        "[07:45:15] [ERROR] Task aborted with exit code 504. Sent to dead-letter queue."
      ],
      links: [
        { label: "Dead-Letter Queue Message", url: "https://dlq.internal.net/msg/TASK-104" }
      ]
    }
  },
  {
    id: "TASK-105",
    title: "PostgreSQL Partition Pruning & VACUUM ANALYZE",
    description: "Weekly table maintenance and dead-tuple compaction for audit logs.",
    status: "backlog",
    priority: "low",
    worker: "worker-node-us-east-1",
    tags: ["database", "maintenance", "sql"],
    createdAt: "2026-10-01 05:00",
    payload: {
      tables: ["audit_events_2026_09", "system_metrics_hourly"],
      vacuumMode: "ANALYZE",
      lockTimeoutMs: 3000
    },
    result: null
  },
  {
    id: "TASK-106",
    title: "Multi-Region Cloudflare CDN Cache Purge",
    description: "Invalidate static asset cache following release tag v3.12.0.",
    status: "backlog",
    priority: "medium",
    worker: "edge-notifier-service",
    tags: ["cdn", "deploy", "cache"],
    createdAt: "2026-10-01 10:00",
    payload: {
      zoneId: "zn_9942a7b8e",
      purgePaths: ["/assets/*", "/api/v1/config"]
    },
    result: null
  }
];

// ============================================================================
// Application State Management
// ============================================================================
class TaskManager {
  constructor() {
    this.storageKey = "workerflow_tasks_v1";
    this.tasks = this.loadTasks();
    this.activeTaskId = null; // currently inspected task in drawer
    this.currentView = "kanban"; // "kanban" or "table"
    this.searchQuery = "";
    this.filters = {
      priority: "all",
      worker: "all",
      result: "all"
    };
  }

  loadTasks() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to parse stored tasks, falling back to default.", e);
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

  resetToDefault() {
    this.tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
    this.saveTasks();
  }

  getAllTasks() {
    return this.tasks;
  }

  getFilteredTasks() {
    return this.tasks.filter(task => {
      // Search query check
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

      // Worker node filter
      if (this.filters.worker !== "all" && task.worker !== this.filters.worker) {
        return false;
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
      priority: taskData.priority || "medium",
      worker: taskData.worker || "worker-node-us-east-1",
      tags: taskData.tags || [],
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

  getMetrics() {
    const total = this.tasks.length;
    const running = this.tasks.filter(t => t.status === "running").length;
    const done = this.tasks.filter(t => t.status === "done").length;
    const failed = this.tasks.filter(t => t.status === "failed" || (t.result && t.result.status === "failure")).length;
    const successTasks = this.tasks.filter(t => t.result && t.result.status === "success").length;
    const completedWithResult = this.tasks.filter(t => t.result && t.result.status).length;
    const rate = completedWithResult > 0 ? Math.round((successTasks / completedWithResult) * 100) : 0;

    return { total, running, done, failed, success: successTasks, rate };
  }

  getWorkerList() {
    const workers = new Set();
    this.tasks.forEach(t => {
      if (t.worker) workers.add(t.worker);
    });
    return Array.from(workers);
  }
}

// Instantiate state manager
const appState = new TaskManager();

// ============================================================================
// UI Controller & Renderers
// ============================================================================

// DOM Elements Cache
const dom = {
  // Metrics
  metricTotal: document.getElementById("metricTotal"),
  metricRunning: document.getElementById("metricRunning"),
  metricSuccess: document.getElementById("metricSuccess"),
  metricFailed: document.getElementById("metricFailed"),
  metricRate: document.getElementById("metricRate"),

  // Containers
  kanbanBoard: document.getElementById("kanbanBoard"),
  tableViewContainer: document.getElementById("tableViewContainer"),
  matrixTableBody: document.getElementById("matrixTableBody"),

  // Columns & counters
  colCards: {
    backlog: document.getElementById("cards-backlog"),
    running: document.getElementById("cards-running"),
    review: document.getElementById("cards-review"),
    done: document.getElementById("cards-done"),
    failed: document.getElementById("cards-failed")
  },
  colCounts: {
    backlog: document.getElementById("count-backlog"),
    running: document.getElementById("count-running"),
    review: document.getElementById("count-review"),
    done: document.getElementById("count-done"),
    failed: document.getElementById("count-failed")
  },

  // Search & Filter controls
  searchInput: document.getElementById("searchInput"),
  clearSearch: document.getElementById("clearSearch"),
  filterPriority: document.getElementById("filterPriority"),
  filterWorker: document.getElementById("filterWorker"),
  filterResult: document.getElementById("filterResult"),
  viewKanbanBtn: document.getElementById("viewKanbanBtn"),
  viewTableBtn: document.getElementById("viewTableBtn"),

  // Header Actions
  btnNewTask: document.getElementById("btnNewTask"),
  btnSimulateAll: document.getElementById("btnSimulateAll"),
  btnResetDemo: document.getElementById("btnResetDemo"),

  // Drawer
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
  logCount: document.getElementById("logCount"),
  taskPayloadContent: document.getElementById("taskPayloadContent"),
  resourcesList: document.getElementById("resourcesList"),
  btnCopyResultJson: document.getElementById("btnCopyResultJson"),
  btnDownloadResult: document.getElementById("btnDownloadResult"),
  btnCopyLogs: document.getElementById("btnCopyLogs"),
  btnAddExternalLink: document.getElementById("btnAddExternalLink"),

  // Task Modal
  taskModal: document.getElementById("taskModal"),
  taskForm: document.getElementById("taskForm"),
  taskFormId: document.getElementById("taskFormId"),
  modalTaskTitle: document.getElementById("modalTaskTitle"),
  inputTaskTitle: document.getElementById("inputTaskTitle"),
  selectTaskStatus: document.getElementById("selectTaskStatus"),
  selectTaskPriority: document.getElementById("selectTaskPriority"),
  inputTaskWorker: document.getElementById("inputTaskWorker"),
  inputTaskTags: document.getElementById("inputTaskTags"),
  inputTaskDesc: document.getElementById("inputTaskDesc"),
  inputTaskPayload: document.getElementById("inputTaskPayload"),
  btnCloseTaskModal: document.getElementById("btnCloseTaskModal"),
  btnCancelTaskModal: document.getElementById("btnCancelTaskModal"),

  // Result Modal
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

  // Link Modal
  linkModal: document.getElementById("linkModal"),
  linkForm: document.getElementById("linkForm"),
  inputLinkLabel: document.getElementById("inputLinkLabel"),
  inputLinkUrl: document.getElementById("inputLinkUrl"),
  btnCloseLinkModal: document.getElementById("btnCloseLinkModal"),
  btnCancelLinkModal: document.getElementById("btnCancelLinkModal"),

  // Toasts
  toastContainer: document.getElementById("toastContainer")
};

// ============================================================================
// Render Functions
// ============================================================================

function renderMetrics() {
  const m = appState.getMetrics();
  dom.metricTotal.textContent = m.total;
  dom.metricRunning.textContent = m.running;
  dom.metricSuccess.textContent = m.success;
  dom.metricFailed.textContent = m.failed;
  dom.metricRate.textContent = `${m.rate}%`;
}

function updateWorkerFilterOptions() {
  const currentVal = dom.filterWorker.value;
  const workers = appState.getWorkerList();
  
  dom.filterWorker.innerHTML = '<option value="all">All Worker Nodes</option>';
  workers.forEach(w => {
    const opt = document.createElement("option");
    opt.value = w;
    opt.textContent = w;
    if (w === currentVal) opt.selected = true;
    dom.filterWorker.appendChild(opt);
  });
}

function renderKanban() {
  // Clear all columns
  Object.values(dom.colCards).forEach(el => el.innerHTML = "");

  const filteredTasks = appState.getFilteredTasks();
  const columnCounts = { backlog: 0, running: 0, review: 0, done: 0, failed: 0 };

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

  // Update counts
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

  // Drag event listeners
  card.addEventListener("dragstart", handleDragStart);
  card.addEventListener("dragend", handleDragEnd);

  // Result Badge / Hook calculation
  let resultBoxHtml = "";
  if (task.result) {
    const resStatus = task.result.status || "none";
    let statusClass = "none";
    let statusText = "No Result";

    if (resStatus === "success") {
      statusClass = "has-success";
      statusText = "🟢 Execution Success";
    } else if (resStatus === "failure") {
      statusClass = "has-failed";
      statusText = "🔴 Failed / Error";
    } else if (resStatus === "running") {
      statusClass = "has-running";
      statusText = "⚡ Executing...";
    } else if (resStatus === "partial") {
      statusClass = "has-running";
      statusText = "🟡 Warnings Flagged";
    }

    resultBoxHtml = `
      <div class="card-result-box ${statusClass}" data-action="open-result" title="Click to inspect execution results">
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
          <span class="result-status-tag none">⚪ No Result Attached</span>
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

  card.innerHTML = `
    <div class="card-top-row">
      <span class="task-id-badge">${escapeHtml(task.id)}</span>
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
      <span>${escapeHtml(task.worker || "unassigned")}</span>
    </div>
    ${tagsHtml ? `<div class="card-tags">${tagsHtml}</div>` : ""}
    ${resultBoxHtml}
    <div class="card-footer">
      <span class="card-timestamp">${escapeHtml(task.createdAt || "")}</span>
      <div class="card-action-links">
        <button type="button" class="btn-card-action action-inspect" data-action="open-drawer" title="Inspect Results & Logs">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span>Results</span>
        </button>
        <button type="button" class="btn-card-action" data-action="quick-run" title="Run worker simulation">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>
      </div>
    </div>
  `;

  // Click delegation inside card
  card.addEventListener("click", e => {
    const actionEl = e.target.closest("[data-action]");
    if (actionEl) {
      const action = actionEl.dataset.action;
      if (action === "open-drawer" || action === "open-result") {
        openResultsDrawer(task.id);
      } else if (action === "quick-run") {
        simulateWorkerRun(task.id);
      }
    } else {
      // Default to opening results drawer
      openResultsDrawer(task.id);
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
        <td colspan="9" style="text-align: center; padding: 2rem; color: var(--text-dim);">
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
    let lastRun = task.createdAt;

    if (task.result) {
      const st = task.result.status;
      resultStatusBadge = `<span class="result-badge ${st}">${st.toUpperCase()}</span>`;
      durationText = task.result.duration || "—";
      summaryText = task.result.summary || "Completed";
      lastRun = task.result.executedAt || task.createdAt;
    }

    tr.innerHTML = `
      <td><span class="task-id-badge">${escapeHtml(task.id)}</span></td>
      <td>
        <div style="font-weight: 600; color: var(--text-main); cursor: pointer;" class="table-task-link">${escapeHtml(task.title)}</div>
        <div style="font-size: 0.72rem; color: var(--text-dim); font-family: var(--font-mono);">${escapeHtml(task.worker || "unassigned")}</div>
      </td>
      <td><span class="status-pill status-${task.status}">${task.status}</span></td>
      <td><span class="priority-badge priority-${task.priority}">${task.priority}</span></td>
      <td>${resultStatusBadge}</td>
      <td style="font-family: var(--font-mono); font-size: 0.8rem;">${escapeHtml(durationText)}</td>
      <td style="max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-muted); font-size: 0.8rem;">
        ${escapeHtml(summaryText)}
      </td>
      <td style="font-size: 0.75rem; color: var(--text-dim);">${escapeHtml(lastRun)}</td>
      <td>
        <div style="display: flex; gap: 0.4rem;">
          <button type="button" class="btn btn-sm btn-ghost" data-action="view-results" title="Inspect Results">Results</button>
          <button type="button" class="btn btn-sm btn-secondary" data-action="run-task" title="Run Task">▶</button>
        </div>
      </td>
    `;

    tr.querySelector(".table-task-link").addEventListener("click", () => openResultsDrawer(task.id));
    tr.querySelector('[data-action="view-results"]').addEventListener("click", () => openResultsDrawer(task.id));
    tr.querySelector('[data-action="run-task"]').addEventListener("click", () => simulateWorkerRun(task.id));

    dom.matrixTableBody.appendChild(tr);
  });
}

function renderAll() {
  renderMetrics();
  updateWorkerFilterOptions();
  if (appState.currentView === "kanban") {
    renderKanban();
  } else {
    renderTableView();
  }
}

// ============================================================================
// Results Inspector Drawer Logic
// ============================================================================
function openResultsDrawer(taskId) {
  const task = appState.getTaskById(taskId);
  if (!task) return;

  appState.activeTaskId = taskId;

  // Set Header Information
  dom.drawerTaskId.textContent = task.id;
  dom.drawerTaskTitle.textContent = task.title;
  dom.drawerTaskDesc.textContent = task.description || "No description provided.";
  dom.drawerStatusPill.textContent = task.status;
  dom.drawerStatusPill.className = `status-pill status-${task.status}`;

  // Set Result Badge & Metric Cards
  if (task.result) {
    const resStatus = task.result.status;
    dom.drawerResultBadge.textContent = resStatus.toUpperCase();
    dom.drawerResultBadge.className = `result-badge ${resStatus}`;
    dom.statDuration.textContent = task.result.duration || "—";
    dom.statWorker.textContent = task.worker || "—";
    dom.statRecords.textContent = task.result.recordsCount !== undefined ? `${task.result.recordsCount} items` : "—";
    dom.statExitCode.textContent = `Exit ${task.result.exitCode ?? 0} • ${task.result.memoryUsage || "Normal"}`;

    // Output Artifacts
    const jsonStr = JSON.stringify(task.result.data || task.result, null, 2);
    dom.artifactJsonContent.textContent = jsonStr;

    // Terminal Logs
    renderTerminalLogs(task.result.logs || []);

    // Linked Resources
    renderResourceLinks(task.result.links || []);
  } else {
    dom.drawerResultBadge.textContent = "NO RESULT YET";
    dom.drawerResultBadge.className = "result-badge none";
    dom.statDuration.textContent = "—";
    dom.statWorker.textContent = task.worker || "—";
    dom.statRecords.textContent = "0 items";
    dom.statExitCode.textContent = "Exit —";

    dom.artifactJsonContent.textContent = "// No output data generated yet.\n// Click 'Run Worker Now' or attach a result manually.";
    renderTerminalLogs([
      `[${new Date().toLocaleTimeString()}] [system] Task initialized in ${task.status} state`,
      `[${new Date().toLocaleTimeString()}] [system] Waiting for worker dispatch...`
    ]);
    renderResourceLinks([]);
  }

  // Task Parameters / Payload
  dom.taskPayloadContent.textContent = JSON.stringify(task.payload || {}, null, 2);

  // Show Drawer
  dom.drawer.classList.add("open");
  dom.drawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeResultsDrawer() {
  dom.drawer.classList.remove("open");
  dom.drawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  appState.activeTaskId = null;
}

function renderTerminalLogs(logs) {
  dom.terminalLogs.innerHTML = "";
  dom.logCount.textContent = logs.length;

  if (logs.length === 0) {
    dom.terminalLogs.innerHTML = `<div class="terminal-line"><span class="log-dim">[empty]</span> No log records.</div>`;
    return;
  }

  logs.forEach(line => {
    const lineEl = document.createElement("div");
    lineEl.className = "terminal-line";

    let formatted = escapeHtml(line);
    formatted = formatted
      .replace(/(\[INFO\])/g, '<span class="log-info">$1</span>')
      .replace(/(\[SUCCESS\])/g, '<span class="log-success">$1</span>')
      .replace(/(\[WARN\])/g, '<span class="log-warn">$1</span>')
      .replace(/(\[ERROR\])/g, '<span class="log-error">$1</span>')
      .replace(/(\[\d{2}:\d{2}:\d{2}\])/g, '<span class="log-dim">$1</span>');

    lineEl.innerHTML = formatted;
    dom.terminalLogs.appendChild(lineEl);
  });

  // Scroll to bottom of logs
  dom.terminalLogs.scrollTop = dom.terminalLogs.scrollHeight;
}

function renderResourceLinks(links) {
  dom.resourcesList.innerHTML = "";
  if (!links || links.length === 0) {
    dom.resourcesList.innerHTML = `<li class="empty-list-msg">No external resources linked to this task yet.</li>`;
    return;
  }

  links.forEach((link, idx) => {
    const li = document.createElement("li");
    li.className = "resource-item";
    li.innerHTML = `
      <div class="resource-link-info">
        <span class="resource-label">${escapeHtml(link.label)}</span>
        <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="resource-url">
          ${escapeHtml(link.url)} &nearr;
        </a>
      </div>
      <button type="button" class="btn-remove-resource" data-idx="${idx}" title="Remove link">&times;</button>
    `;

    li.querySelector(".btn-remove-resource").addEventListener("click", () => {
      removeResourceLink(idx);
    });

    dom.resourcesList.appendChild(li);
  });
}

function removeResourceLink(index) {
  if (!appState.activeTaskId) return;
  const task = appState.getTaskById(appState.activeTaskId);
  if (task && task.result && task.result.links) {
    task.result.links.splice(index, 1);
    appState.saveTasks();
    renderResourceLinks(task.result.links);
    showToast("Resource link removed", "warning");
  }
}

// ============================================================================
// Worker Simulation Engine (Real-Time Dynamic Feedback)
// ============================================================================
function simulateWorkerRun(taskId) {
  const task = appState.getTaskById(taskId);
  if (!task) return;

  showToast(`Worker dispatched for ${task.id}...`, "warning");

  // Move task to 'running'
  appState.updateTaskStatus(taskId, "running");
  task.result = {
    status: "running",
    exitCode: "—",
    duration: "Running...",
    summary: "Worker execution in progress...",
    recordsCount: 0,
    memoryUsage: "Allocating...",
    executedAt: new Date().toLocaleTimeString(),
    data: { status: "running" },
    logs: [
      `[${new Date().toLocaleTimeString()}] [INFO] Assigned runner on node: ${task.worker || "worker-node-us-east-1"}`,
      `[${new Date().toLocaleTimeString()}] [INFO] Injecting input configuration payload...`,
      `[${new Date().toLocaleTimeString()}] [INFO] Process container spinup complete (PID: ${Math.floor(Math.random() * 8000 + 1000)})`
    ],
    links: task.result ? task.result.links : []
  };
  appState.saveTasks();
  renderAll();

  if (appState.activeTaskId === taskId) {
    openResultsDrawer(taskId);
  }

  // Simulate progress step 1
  setTimeout(() => {
    if (!task.result) return;
    const timeStr = new Date().toLocaleTimeString();
    task.result.logs.push(`[${timeStr}] [INFO] Processing input stream: records streaming cleanly...`);
    task.result.logs.push(`[${timeStr}] [INFO] Memory consumption: 88MB, CPU load: 24%`);
    appState.saveTasks();
    if (appState.activeTaskId === taskId) {
      renderTerminalLogs(task.result.logs);
    }
  }, 900);

  // Simulate progress step 2 (completion)
  setTimeout(() => {
    const finishTime = new Date().toLocaleTimeString();
    const isSuccess = Math.random() > 0.15; // 85% success rate
    const elapsed = (Math.random() * 2 + 0.8).toFixed(2);
    const count = Math.floor(Math.random() * 900 + 150);

    if (isSuccess) {
      task.status = "done";
      task.result.status = "success";
      task.result.exitCode = 0;
      task.result.duration = `${elapsed}s`;
      task.result.recordsCount = count;
      task.result.memoryUsage = "112MB";
      task.result.summary = `Processed ${count} items with exit code 0`;
      task.result.data = {
        status: "completed",
        itemsGenerated: count,
        checksum: `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
        destination: `s3://automation-worker-data/runs/${task.id.toLowerCase()}/output.json`,
        latencyMs: Math.round(elapsed * 1000)
      };
      task.result.logs.push(`[${finishTime}] [SUCCESS] Job finished successfully in ${elapsed}s`);
      task.result.logs.push(`[${finishTime}] [SUCCESS] Output artifact flushed to object storage (Exit 0)`);
      showToast(`${task.id} finished successfully!`, "success");
    } else {
      task.status = "failed";
      task.result.status = "failure";
      task.result.exitCode = 1;
      task.result.duration = `${elapsed}s`;
      task.result.recordsCount = 0;
      task.result.memoryUsage = "140MB";
      task.result.summary = `Process exited with code 1: Connection reset`;
      task.result.data = {
        error: "ConnectionResetByPeer",
        exitCode: 1,
        retriesRemaining: 0
      };
      task.result.logs.push(`[${finishTime}] [ERROR] Unexpected socket termination from peer service`);
      task.result.logs.push(`[${finishTime}] [ERROR] Process terminated with Exit Code 1`);
      showToast(`${task.id} failed with exit code 1!`, "danger");
    }

    appState.saveTasks();
    renderAll();

    if (appState.activeTaskId === taskId) {
      openResultsDrawer(taskId);
    }
  }, 2200);
}

function simulateRunAllQueued() {
  const queued = appState.tasks.filter(t => t.status === "backlog");
  if (queued.length === 0) {
    showToast("No queued tasks in Backlog to execute.", "warning");
    return;
  }

  showToast(`Queueing ${queued.length} task(s) to worker pool...`, "success");
  queued.forEach((t, i) => {
    setTimeout(() => {
      simulateWorkerRun(t.id);
    }, i * 700);
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
  const columns = document.querySelectorAll(".kanban-column");
  columns.forEach(col => {
    col.addEventListener("dragover", e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      col.classList.add("drag-over");
    });

    col.addEventListener("dragleave", e => {
      // Check if genuinely leaving the column
      if (!col.contains(e.relatedTarget)) {
        col.classList.remove("drag-over");
      }
    });

    col.addEventListener("drop", e => {
      e.preventDefault();
      col.classList.remove("drag-over");
      const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
      const targetStatus = col.dataset.status;

      if (taskId && targetStatus) {
        const task = appState.getTaskById(taskId);
        if (task && task.status !== targetStatus) {
          appState.updateTaskStatus(taskId, targetStatus);
          renderAll();
          showToast(`Moved ${task.id} to ${targetStatus.toUpperCase()}`, "success");
        }
      }
    });
  });
}

// ============================================================================
// Dialogs: Task CRUD & Result Editing
// ============================================================================

function openTaskModal(taskId = null, defaultStatus = "backlog") {
  dom.taskForm.reset();

  if (taskId) {
    const task = appState.getTaskById(taskId);
    if (!task) return;
    dom.modalTaskTitle.textContent = `Edit Task ${task.id}`;
    dom.taskFormId.value = task.id;
    dom.inputTaskTitle.value = task.title;
    dom.selectTaskStatus.value = task.status;
    dom.selectTaskPriority.value = task.priority;
    dom.inputTaskWorker.value = task.worker || "";
    dom.inputTaskTags.value = (task.tags || []).join(", ");
    dom.inputTaskDesc.value = task.description || "";
    dom.inputTaskPayload.value = JSON.stringify(task.payload || {}, null, 2);
  } else {
    dom.modalTaskTitle.textContent = "Create New Task";
    dom.taskFormId.value = "";
    dom.selectTaskStatus.value = defaultStatus;
    dom.selectTaskPriority.value = "medium";
    dom.inputTaskWorker.value = "worker-node-us-east-1";
    dom.inputTaskPayload.value = '{\n  "batchSize": 500,\n  "timeout": 30\n}';
  }

  dom.taskModal.showModal();
}

function handleTaskFormSubmit(e) {
  e.preventDefault();
  const id = dom.taskFormId.value;
  const title = dom.inputTaskTitle.value.trim();
  if (!title) return;

  const status = dom.selectTaskStatus.value;
  const priority = dom.selectTaskPriority.value;
  const worker = dom.inputTaskWorker.value.trim() || "worker-node-us-east-1";
  const desc = dom.inputTaskDesc.value.trim();
  const rawTags = dom.inputTaskTags.value.split(",").map(t => t.trim()).filter(Boolean);

  let payload = {};
  try {
    if (dom.inputTaskPayload.value.trim()) {
      payload = JSON.parse(dom.inputTaskPayload.value.trim());
    }
  } catch (err) {
    alert("Invalid JSON format in Task Payload. Please fix before saving.");
    return;
  }

  if (id) {
    appState.updateTask(id, {
      title,
      status,
      priority,
      worker,
      tags: rawTags,
      description: desc,
      payload
    });
    showToast(`Updated ${id}`, "success");
    if (appState.activeTaskId === id) {
      openResultsDrawer(id);
    }
  } else {
    const created = appState.addTask({
      title,
      status,
      priority,
      worker,
      tags: rawTags,
      description: desc,
      payload
    });
    showToast(`Created task ${created.id}`, "success");
  }

  dom.taskModal.close();
  renderAll();
}

// Result Modal Handlers
function openResultModal(taskId) {
  const task = appState.getTaskById(taskId);
  if (!task) return;

  dom.resultForm.reset();
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
    dom.inputResultDuration.value = "1.50s";
    dom.inputResultSummary.value = "Task executed cleanly with 0 errors";
    dom.inputResultExitCode.value = "0";
    dom.inputResultJson.value = '{\n  "status": "ok",\n  "processed": 100\n}';
    dom.inputResultLogs.value = `[${new Date().toLocaleTimeString()}] [INFO] Manual result attached\n[${new Date().toLocaleTimeString()}] [SUCCESS] Task executed cleanly`;
  }

  dom.resultModal.showModal();
}

function handleResultFormSubmit(e) {
  e.preventDefault();
  const taskId = dom.resultFormTaskId.value;
  const task = appState.getTaskById(taskId);
  if (!task) return;

  let parsedData = {};
  try {
    if (dom.inputResultJson.value.trim()) {
      parsedData = JSON.parse(dom.inputResultJson.value.trim());
    }
  } catch (err) {
    alert("Invalid JSON format in Result Data Payload.");
    return;
  }

  const logs = dom.inputResultLogs.value
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const newResult = {
    status: dom.selectResultStatus.value,
    duration: dom.inputResultDuration.value.trim() || "1.0s",
    summary: dom.inputResultSummary.value.trim() || "Completed",
    exitCode: parseInt(dom.inputResultExitCode.value, 10) || 0,
    recordsCount: parsedData.processed || parsedData.items || 1,
    memoryUsage: "Normal",
    executedAt: new Date().toLocaleTimeString(),
    data: parsedData,
    logs: logs,
    links: task.result ? task.result.links || [] : []
  };

  appState.attachResult(taskId, newResult);

  // Sync status if completed
  if (newResult.status === "success" && task.status !== "done") {
    task.status = "done";
  } else if (newResult.status === "failure" && task.status !== "failed") {
    task.status = "failed";
  }
  appState.saveTasks();

  dom.resultModal.close();
  renderAll();
  openResultsDrawer(taskId);
  showToast(`Results linked to ${taskId}`, "success");
}

// Add External Link Modal
function openLinkModal() {
  dom.linkForm.reset();
  dom.linkModal.showModal();
}

function handleLinkFormSubmit(e) {
  e.preventDefault();
  if (!appState.activeTaskId) return;
  const task = appState.getTaskById(appState.activeTaskId);
  if (!task) return;

  const label = dom.inputLinkLabel.value.trim();
  const url = dom.inputLinkUrl.value.trim();

  if (!task.result) {
    task.result = {
      status: "partial",
      duration: "—",
      summary: "External resource linked",
      logs: [],
      data: {},
      links: []
    };
  }

  if (!task.result.links) {
    task.result.links = [];
  }

  task.result.links.push({ label, url });
  appState.saveTasks();
  dom.linkModal.close();
  renderResourceLinks(task.result.links);
  showToast("Resource link attached", "success");
}

// ============================================================================
// Utilities & Toast System
// ============================================================================
function escapeHtml(str) {
  if (typeof str !== "string") return String(str ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  dom.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 2800);
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

  dom.filterWorker.addEventListener("change", e => {
    appState.filters.worker = e.target.value;
    renderAll();
  });

  dom.filterResult.addEventListener("change", e => {
    appState.filters.result = e.target.value;
    renderAll();
  });

  // View Switchers
  dom.viewKanbanBtn.addEventListener("click", () => {
    appState.currentView = "kanban";
    dom.viewKanbanBtn.classList.add("active");
    dom.viewTableBtn.classList.remove("active");
    dom.kanbanBoard.classList.remove("hidden");
    dom.tableViewContainer.classList.add("hidden");
    renderAll();
  });

  dom.viewTableBtn.addEventListener("click", () => {
    appState.currentView = "table";
    dom.viewTableBtn.classList.add("active");
    dom.viewKanbanBtn.classList.remove("active");
    dom.kanbanBoard.classList.add("hidden");
    dom.tableViewContainer.classList.remove("hidden");
    renderAll();
  });

  // Header Actions
  dom.btnNewTask.addEventListener("click", () => openTaskModal(null, "backlog"));
  dom.btnSimulateAll.addEventListener("click", simulateRunAllQueued);
  dom.btnResetDemo.addEventListener("click", () => {
    if (confirm("Reset dashboard data to original demo state?")) {
      appState.resetToDefault();
      renderAll();
      showToast("Reset to demo dataset", "success");
    }
  });

  // Add task button from column headers
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
    if (confirm(`Are you sure you want to delete task ${appState.activeTaskId}?`)) {
      const id = appState.activeTaskId;
      closeResultsDrawer();
      appState.deleteTask(id);
      renderAll();
      showToast(`Deleted ${id}`, "danger");
    }
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

  // Dialog Form Submissions & Cancels
  dom.taskForm.addEventListener("submit", handleTaskFormSubmit);
  dom.btnCloseTaskModal.addEventListener("click", () => dom.taskModal.close());
  dom.btnCancelTaskModal.addEventListener("click", () => dom.taskModal.close());

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
