# DataLund Task List

Free custom **Task List** visual for Microsoft Power BI by **DataLund** ([datalund.no](https://datalund.no)).

Browse and select tasks/projects — scannable rows with optional RAG status chips, progress, groups, and dates that **cross-filter** Gantt, Resource Load, and native visuals.

| Path | Purpose |
| --- | --- |
| [`TASK_LIST.md`](TASK_LIST.md) | Agent kickoff brief (suite contracts + acceptance) |
| [`WEBSITE.md`](WEBSITE.md) | **Website agent brief** — promo copy, URLs, suite positioning |
| [`website-sync/`](website-sync/) | Drop-in product page + downloads for `Datalundno/Website` |
| [`taskList/`](taskList/) | Power BI visual + package |
| [`taskList/whitelabel/`](taskList/whitelabel/) | Unbranded identity overlays (personal build) |
| [`taskList/docs/APPSOURCE.md`](taskList/docs/APPSOURCE.md) | AppSource upload checklist |
| [`taskList/docs/WHITELABEL.md`](taskList/docs/WHITELABEL.md) | White-label build notes |
| [`taskList/downloads/`](taskList/downloads/) | Packaged `.pbiviz` + sample Excel |

## One job

| Visual | Answers |
| --- | --- |
| **Gantt** | *when* |
| **Resource Load** | *who is busy* |
| **Task List** | *what’s in the portfolio right now* — pick rows to filter the page |

## Quick start

```bash
cd taskList
npm install
npm start          # developer visual
npm run package    # branded .pbiviz
npm run package:whitelabel  # unbranded TaskList.pbiviz (personal only)
```

Import `taskList/downloads/taskList.pbiviz` into Power BI Desktop (**Import a visual from a file**).

### Downloads

| Build | Link |
| --- | --- |
| **Branded** — DataLund Task List 1.0.0.0 | [`taskList/downloads/taskList.pbiviz`](taskList/downloads/taskList.pbiviz) · [release](https://github.com/Datalundno/Task-List/releases/tag/v1.0.0.0) |
| **Unbranded (personal)** — Task List 1.0.0.0 | [`taskList/downloads/TaskList.pbiviz`](taskList/downloads/TaskList.pbiviz) · [release](https://github.com/Datalundno/Task-List/releases/tag/whitelabel-1.0.0.0) |
| Sample Excel | [`taskList/downloads/TaskListSampleData.xlsx`](taskList/downloads/TaskListSampleData.xlsx) |

The unbranded build is **personal only** — do **not** put it on datalund.no. Rebuild with `cd taskList && npm run package:whitelabel`.

## Field binding

Role **`name`** values match the DataLund suite so reports can reuse the same columns:

| Field well | Role `name` | Required | Notes |
| --- | --- | --- | --- |
| Project | `task` | **Yes** | Row title |
| RAG | `status` | Recommended | Free text or RAG (`Red`/`Amber`/`Green`, `R`/`A`/`G`, etc.) |
| Group | `group` | No | Phase / parent → section headers or column |
| Project lead | `resource` | No | Assignee column |
| Progress | `progress` | No | 0–1 or 0–100 |
| Start Date | `startDate` | No | Column / sort |
| End Date | `endDate` | No | Column / sort |
| Duration | `duration` | No | Days; used when End is absent |
| Tooltips | `tooltipFields` | No | Up to 8 extra fields |

### Status / RAG mapping

Case-insensitive. Unknown values get a neutral chip; full text stays in the tooltip.

| Level | Accepted examples |
| --- | --- |
| Red | Red, R, Critical, Blocked, Off track, **Rød** / Rod |
| Amber | Amber, Yellow, A, At risk, Watch, **Gul** |
| Green | Green, G, On track, OK, Healthy, **Grønn** / Gronn |

Override the three RAG colors under **Format → Status**.

### Density

**Format → General → Density** uses the suite presets: **Compact**, **Comfortable** (default), **Large**, **Custom**. Same names/numbers as DataLund Gantt.

### Row limit

Table mapping uses a top count of **30 000** rows (same mindset as Gantt). Prefer pre-aggregated “latest pulse” rows for Microsoft Lists history.

## Sample data & Lists mapping

Sample workbook: [`taskList/downloads/TaskListSampleData.xlsx`](taskList/downloads/TaskListSampleData.xlsx)

| Microsoft Lists field | Role |
| --- | --- |
| Project name | `task` |
| Project status / RAG | `status` |
| Project lead | `resource` |
| Phase / Type / Domain | `group` |
| Progress (%) | `progress` |
| Start / Estimated end | `startDate` / `endDate` |
| Next milestone, obstacles, notes | `tooltipFields` |

Tip: bind the **latest** update’s RAG/progress so the list shows current pulse, not history.

## Suite

Sibling visuals live in separate repos. Shared contracts: density presets + field role names (see [`TASK_LIST.md`](TASK_LIST.md) and Gantt `SUITE.md`).

| Visual | Answers |
| --- | --- |
| [DataLund Gantt](https://github.com/Datalundno/GANTT) | *when* |
| Resource Load | *who is busy* |
| **DataLund Task List** | *what’s in the portfolio* — browse + select |

## Website / promotion

Point the **Website** agent at [`WEBSITE.md`](WEBSITE.md) and [`website-sync/APPLY.md`](website-sync/APPLY.md).

- Product URL: https://datalund.no/visuals/task-list/
- Download: https://datalund.no/downloads/taskList.pbiviz
- Ready HTML + `.pbiviz` + sample Excel live under [`website-sync/`](website-sync/)

## Privacy

Sandbox-only; no telemetry or network calls. See [`taskList/docs/PRIVACY.md`](taskList/docs/PRIVACY.md).
