# DataLund Task List

Free custom **Task List** visual for Microsoft Power BI by **DataLund** ([datalund.no](https://datalund.no)).

Browse and select tasks/projects — scannable rows with optional RAG status chips, progress, groups, and dates that **cross-filter** Gantt, Resource Load, and native visuals via Power BI **selection** (not the Filter API).

| Path | Purpose |
| --- | --- |
| [`ECOSYSTEM.md`](ECOSYSTEM.md) | Pointer to the suite contract (canonical on Website) |
| [`TASK_LIST.md`](TASK_LIST.md) | Agent kickoff brief (suite contracts + acceptance) |
| [`WEBSITE.md`](WEBSITE.md) | Website agent brief — promo copy, URLs, suite positioning |
| [`LICENSE`](LICENSE) | MIT |
| [`taskList/`](taskList/) | Power BI visual + package |
| [`taskList/docs/CERTIFICATION.md`](taskList/docs/CERTIFICATION.md) | Certification notes (render events, selection vs filter) |
| [`taskList/docs/APPSOURCE.md`](taskList/docs/APPSOURCE.md) | AppSource upload checklist |
| [`taskList/docs/WHITELABEL.md`](taskList/docs/WHITELABEL.md) | White-label build notes |
| [`taskList/downloads/`](taskList/downloads/) | Branded `.pbiviz` + sample Excel |

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
```

Import `taskList/downloads/taskList.pbiviz` into Power BI Desktop (**Import a visual from a file**).

### Downloads

| Build | Link |
| --- | --- |
| **Branded** — DataLund Task List 1.0.3.0 | [`taskList/downloads/taskList.pbiviz`](taskList/downloads/taskList.pbiviz) · [release](https://github.com/Datalundno/Task-List/releases/tag/v1.0.3.0) |
| Sample Excel | [`taskList/downloads/TaskListSampleData.xlsx`](taskList/downloads/TaskListSampleData.xlsx) |

This **`certification`** branch contains only the branded visual GUID for AppSource review.

## Field binding

Role **`name`** values match the DataLund suite ([ECOSYSTEM on Website](https://raw.githubusercontent.com/Datalundno/Website/main/ECOSYSTEM.md) §1) so reports can reuse the same columns:

| Field well | Role `name` | Required | Notes |
| --- | --- | --- | --- |
| Project | `task` | **Yes** | Row title |
| RAG | `status` | Recommended | Free text or RAG (`Red`/`Amber`/`Green`, `Rød`/`Gul`/`Grønn`, …) |
| Group | `group` | No | Phase / parent → section headers or column |
| Project lead | `resource` | No | Assignee column |
| Progress | `progress` | No | 0–1 or 0–100 |
| Start Date | `startDate` | No | Column / sort |
| End Date | `endDate` | No | Preferred end; teach this in samples |
| Duration | `duration` | No | Days when End is absent |
| Tooltips | `tooltipFields` | No | Up to 8 extra fields (wired via `ITooltipService`) |

This is a **list** visual: row color comes from `status` chips (Format → Status). There is no Format → General → Color by enum (that control is for timeline / bar visuals).

### Cross-filtering (selection)

Clicking a row calls `ISelectionManager.select`. Other visuals on the page respond through Power BI’s selection / highlight path. This visual does **not** implement `applyJsonFilter` / Filter API (by design — see [`taskList/docs/CERTIFICATION.md`](taskList/docs/CERTIFICATION.md)).

### Status / RAG mapping

Case-insensitive. Unknown values get a neutral chip; full text stays in the tooltip.

| Level | Accepted examples |
| --- | --- |
| Red | Red, R, Critical, Blocked, Off track, **Rød** / Rod |
| Amber | Amber, Yellow, A, At risk, Watch, **Gul** |
| Green | Green, G, On track, OK, Healthy, **Grønn** / Gronn |

Override the three RAG colors under **Format → Status**.

### Density

**Format → General → Density** uses the suite presets: **Compact**, **Comfortable** (default), **Large**, **Custom**. Same names/numbers as DataLund Gantt (ECOSYSTEM §3).

### Row limit

Table mapping uses a top count of **30 000** rows (same mindset as Gantt). Prefer pre-aggregated “latest pulse” rows for Microsoft Lists history.

## Sample data & Lists mapping

Starter workbook (PM-maintained columns only — ECOSYSTEM §2):

`Project · RAG · Group · Project lead · Progress · Start Date · End Date`

File: [`taskList/downloads/TaskListSampleData.xlsx`](taskList/downloads/TaskListSampleData.xlsx)

Duration and Tooltips are supported by the visual but **not** in the default starter.

| Microsoft Lists field | Role |
| --- | --- |
| Project name | `task` |
| Project status / RAG | `status` |
| Project lead | `resource` |
| Phase / Type / Domain | `group` |
| Progress (%) | `progress` |
| Start / End | `startDate` / `endDate` |
| Next milestone, obstacles, notes | `tooltipFields` |

Tip: bind the **latest** update’s RAG/progress so the list shows current pulse, not history.

## Suite

Sibling visuals live in separate repos. Shared contracts: [Website ECOSYSTEM.md](https://raw.githubusercontent.com/Datalundno/Website/main/ECOSYSTEM.md).

| Visual | Answers |
| --- | --- |
| [DataLund Gantt](https://github.com/Datalundno/GANTT) | *when* |
| [Resource Load](https://github.com/Datalundno/Resource-Load) | *who is busy* |
| **DataLund Task List** | *what’s in the portfolio* — browse + select |

## Website / promotion

Point the **Website** agent at [`WEBSITE.md`](WEBSITE.md). Site HTML and public downloads live in **`Datalundno/Website`** (not in this repo).

- Product URL: https://datalund.no/visuals/task-list/
- Download: https://datalund.no/downloads/taskList.pbiviz

## Privacy

Sandbox-only; no telemetry or network calls. See [`taskList/docs/PRIVACY.md`](taskList/docs/PRIVACY.md).
