# Website agent brief — DataLund Task List

Ship a product page and download for **DataLund Task List 1.0.0.0** on **`Datalundno/Website`**.

This visual is the third suite item (after Gantt and Resource Load). It answers *what’s in the portfolio right now* and lets users **pick rows** to cross-filter the page.

**Do not fold Task List into the Gantt page.** Give it its own route, download, and nav entry.

---

## Identity

| Field | Value |
| --- | --- |
| Display name | **DataLund Task List** |
| Short name | Task List |
| Version | `1.0.0.0` |
| Offer / file | `taskList.pbiviz` |
| Product URL | `https://datalund.no/visuals/task-list/` |
| Download URL | `https://datalund.no/downloads/taskList.pbiviz` |
| Sample data | `https://datalund.no/downloads/TaskListSampleData.xlsx` |
| GitHub | `https://github.com/Datalundno/Task-List` |
| Support | `https://datalund.no/support/` |
| Privacy | `https://datalund.no/privacy/` |
| Publisher | DataLund / Datalund (`datalund.no`) |
| Price | Free |
| AppSource | Not required for v1 site ship (file download first) |

---

## Positioning (suite)

Use this trio consistently on home / visuals sections:

| Visual | One-liner |
| --- | --- |
| **DataLund Gantt** | *When* — tasks on a timeline |
| **Resource Load** | *Who is busy* — people on tasks *(sibling; may still be upcoming)* |
| **DataLund Task List** | *What’s in the portfolio* — browse + select rows to filter the page |

**Hero / lede (product page):**

> Browse and select projects in Power BI. RAG status, progress, and groups in one scannable list that cross-filters your report.

**Shorter lede (home card):**

> A project pulse list for Power BI — pick rows to filter Gantt and the rest of the page.

**Anti-pitch (what it is not):** not a mini-dashboard, not an editable list, not a second Gantt. One job: browse + select.

---

## Suggested copy blocks

### SEO / meta

- **Title:** `DataLund Task List — Free Power BI visual | Datalund`
- **Meta description:** `Free Power BI visual to browse projects with RAG status, progress, and groups. Click a row to cross-filter the report.`
- **OG title:** `DataLund Task List — Free Power BI visual`
- **OG description:** `Browse and select projects with RAG chips and progress. Free .pbiviz for Power BI Desktop.`
- **Keywords:** `DataLund Task List, Power BI task list, Power BI project list, RAG status, Power BI visual, pbiviz, PMO dashboard`

### Features (bullets)

- Scannable project / task rows with click-to-filter selection
- Optional RAG status chips (Red / Amber / Green — flexible text mapping)
- Progress bar and percent when Progress is bound
- Group / phase section headers
- Density presets shared with DataLund Gantt (Compact / Comfortable / Large)
- Tooltips for milestones, obstacles, and notes
- No network calls — runs in the Power BI sandbox

### Fields (for help page)

- **Project** (required) — role `task`
- Optional: **RAG** (`status`), **Group**, **Project lead**, **Progress**, **Start / End**, **Duration**, **Tooltips**

### Install blurb

> Download the `.pbiviz`, then in Power BI Desktop use **Import a visual from a file**. Bind **Project**, then add RAG and Progress for a PMO pulse page next to DataLund Gantt.

### CTA labels

- Primary: `Download .pbiviz`
- Secondary: `Sample Excel`
- Tertiary: `Help` → `/visuals/task-list/`

---

## Site changes to make

Apply files from this repo’s [`website-sync/`](website-sync/) (see [`website-sync/APPLY.md`](website-sync/APPLY.md)).

1. **New help page:** `public/visuals/task-list/index.html` (ready-made in sync folder).
2. **Downloads:** copy `taskList.pbiviz` + `TaskListSampleData.xlsx` into `public/downloads/`.
3. **Home page (`index.html` / Vite app):**
   - Add Task List to visuals / nav (at least a second feature section or card).
   - Add SoftwareApplication JSON-LD for Task List (version `1.0.0.0`, download URL above).
   - Optionally mention Task List in the site-wide description once Gantt is no longer the only visual.
4. **Global nav** on help pages: link **DataLund Task List** → `/visuals/task-list/` alongside Gantt.
5. **Do not** invent screenshots/video until assets exist; text + download is enough for v1. If a placeholder stage is needed, reuse list-row language (status chips + progress), not Gantt bars.

---

## Tone & brand notes for the website agent

- Match existing Datalund site: calm, product-first, short sentences.
- Brand name **DataLund Task List** must be the hero-level product name on its page (not only nav text).
- Keep the first viewport tight: brand, one headline, one supporting sentence, CTA group — no stats strips or card clutter in the hero.
- Free visual; same publisher voice as Gantt.
- Cross-link Gantt help ↔ Task List help (“Use next to DataLund Gantt”).

---

## Acceptance (website)

- [ ] `https://datalund.no/visuals/task-list/` live with version **1.0.0.0**
- [ ] `https://datalund.no/downloads/taskList.pbiviz` serves this package
- [ ] Sample Excel download works
- [ ] Home or visuals section promotes Task List with correct one-liner
- [ ] JSON-LD `softwareVersion` = `1.0.0.0`
- [ ] Privacy/support links unchanged and accurate

---

## Source of truth in this repo

| Path | Use |
| --- | --- |
| [`website-sync/`](website-sync/) | Drop-in HTML + downloads + APPLY steps |
| [`TASK_LIST.md`](TASK_LIST.md) | Full product/engineering brief |
| [`README.md`](README.md) | Field binding, RAG mapping, density |
| [`taskList/downloads/`](taskList/downloads/) | Canonical `.pbiviz` + sample Excel |
| [`taskList/docs/PRIVACY.md`](taskList/docs/PRIVACY.md) | Sandbox-only privacy |
| [`taskList/docs/SUPPORT.md`](taskList/docs/SUPPORT.md) | Support contacts |
