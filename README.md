# WorkerFlow • Task & Execution Results Dashboard

A modern, high-performance task orchestration and execution dashboard built with **vanilla HTML5, CSS3, and JavaScript**. Designed specifically for automated worker pipelines, batch jobs, background tasks, and AI/ETL workflows, with deep integration between tasks and their linked execution results.

---

## 🌟 Key Features

### 1. Interactive Kanban Task Board
- **5-Stage Workflow Pipeline**:
  - `Queued / Backlog`: Ready to be scheduled or dispatched to worker nodes.
  - `In Progress / Running`: Active tasks executing on worker pools.
  - `Verifying Results`: Completed jobs pending audit or human sign-off.
  - `Completed`: Successful executions (Exit 0).
  - `Failed / Errors`: Failed runs with dead-letter queue dumps and exit codes.
- **Native HTML5 Drag & Drop**: Effortlessly move tasks between columns with drag targets, drop effects, and visual state indicators.
- **Column Shortcuts**: Direct `+` action on every column to quickly add tasks directly into that status.

### 2. Deeply Linked Execution Results (Inspector Drawer)
Each task card displays an embedded **Linked Results Hook** showing execution status, runtime duration, and summary. Clicking on any card or the **Results** button slides open a comprehensive **Results Inspector Drawer**:
- **Execution Overview**: Duration, assigned worker node, records processed, exit code, and memory usage.
- **Structured Data Artifacts**: Syntax-highlighted JSON viewer with **Copy JSON** and **Download Artifact** actions.
- **Live Terminal Log Stream**: Color-coded log console ([INFO], [WARN], [ERROR], [SUCCESS]) with timestamp parsing and **Copy All Logs** capability.
- **Task Parameters & Configuration**: View input payload dispatched to the worker runner.
- **Attached Resources & URLs**: Direct links to generated S3 Parquet exports, CloudWatch logs, and external audit sheets, with ability to attach new links.
- **Manual Result Attachments**: Manually attach or edit result payloads, exit codes, and logs for any task.

### 3. Real-Time Worker Execution Simulator
- **One-Click Run**: Click "Run Worker Now" on any individual task or "Run Worker Queue" from the top header.
- **Live Feedback**: Watch tasks transition to `Running`, stream real-time logs into the terminal console, and finish in either `Completed` or `Failed` status with automatically synthesized data payloads and metrics.

### 4. Matrix Table View & Multi-Dimensional Filtering
- **Dual View Modes**: Seamlessly toggle between **Kanban Board** and a detailed **Matrix Table**.
- **Search & Filters**:
  - Full-text search across task IDs, titles, descriptions, worker nodes, tags, and result summaries.
  - Filter by priority (`Urgent`, `High`, `Medium`, `Low`).
  - Filter by worker node (dynamically indexed from task assignments).
  - Filter by result state (`Has Linked Results`, `Success Result`, `Failed Result`, `No Results Yet`).

### 5. Local Storage Persistence & Reset
- Auto-syncs all updates, drag movements, task creation, and attached results into browser `localStorage`.
- Includes a one-click **Reset Demo Data** button in the header to easily restore the rich default dataset.

---

## 📁 Project Architecture & File Structure

```
worker-base/
├── index.html        # Semantic HTML5 layout, accessible <dialog> modals, Kanban columns, drawer
├── styles.css        # Cyber-refined dark design system, glassmorphism, responsive grid & animations
├── app.js            # Vanilla JS TaskManager, drag-and-drop controller, worker simulator & inspector
└── README.md         # Architecture overview and documentation
```

### Architectural Breakdown

- [index.html](file:///Users/mbp-m1-pro/Developer/Automation/worker-base/index.html):
  - Structured semantic header containing real-time summary metric pills (`Total`, `Running`, `Success`, `Failed`, `Success Rate`).
  - Search and filter toolbar with view mode toggle.
  - 5-column Kanban board container and collapsible Matrix Table.
  - Native `<dialog>` elements for `Task Modal`, `Result Modal`, and `Link Resource Modal`.
  - Floating slide-out `<aside class="results-drawer">` with backdrop and accessible tab controls.

- [styles.css](file:///Users/mbp-m1-pro/Developer/Automation/worker-base/styles.css):
  - Built with CSS Custom Properties for colors, shadows, border glows, and typography.
  - Dark mode aesthetic utilizing curated Indigo/Cyan accents and glassmorphism (`backdrop-filter: blur(16px)`).
  - Responsive layout adapting to various desktop and widescreen displays.
  - Terminal viewer styling mimicking a native developer console.

- [app.js](file:///Users/mbp-m1-pro/Developer/Automation/worker-base/app.js):
  - `TaskManager`: Central state management class managing in-memory tasks, filtering algorithms, metric calculations, and `localStorage` synchronization.
  - Drag-and-drop controller handling HTML5 `dragstart`, `dragover`, and `drop`.
  - Realistic initial demo dataset simulating web scrapers, LLM embedding jobs, financial reconciliations, and database vacuum maintenance.
  - Asynchronous worker simulation engine with multi-stage timeout sequences and log updates.

---

## 🚀 Getting Started

### Option 1: Open Directly in Browser
Simply open [index.html](file:///Users/mbp-m1-pro/Developer/Automation/worker-base/index.html) in any modern web browser (Chrome, Edge, Safari, Firefox):
```bash
open index.html
```

### Option 2: Run with a Local Static Server
You can serve the directory using Python's built-in HTTP server:
```bash
# From /Users/mbp-m1-pro/Developer/Automation/worker-base
python3 -m http.server 4321
```
Then navigate to [http://localhost:4321](http://localhost:4321).
