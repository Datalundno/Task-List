# Website agent — ship DataLund Task List **1.0.0.0**

Apply in **`Datalundno/Website`**, push to `main` so Pages deploys.

Read the full messaging brief first: [`../WEBSITE.md`](../WEBSITE.md).

## What to ship

| Asset | Site path |
| --- | --- |
| Product / help page | `public/visuals/task-list/index.html` |
| Visual package | `public/downloads/taskList.pbiviz` |
| Sample workbook | `public/downloads/TaskListSampleData.xlsx` |

## Copy from `website-sync/` (Task-List repo)

```bash
SYNC=<path-to-Task-List>/website-sync
mkdir -p public/visuals/task-list public/downloads
cp "$SYNC/public/downloads/taskList.pbiviz" public/downloads/taskList.pbiviz
cp "$SYNC/public/downloads/TaskListSampleData.xlsx" public/downloads/TaskListSampleData.xlsx
cp "$SYNC/public/visuals/task-list/index.html" public/visuals/task-list/index.html
# Then update home/nav JSON-LD per WEBSITE.md (home is app-driven — do not blindly overwrite Gantt home).
git add public/downloads/taskList.pbiviz public/downloads/TaskListSampleData.xlsx public/visuals/task-list/index.html
# + home/nav edits
git commit -m "Ship DataLund Task List 1.0.0.0 product page and download"
git push origin main
```

## Home / nav edits (required)

The sync folder includes a **ready help page** and downloads. The Vite home (`index.html` / `src`) still needs a short Task List feature card or section — copy from [`../WEBSITE.md`](../WEBSITE.md) (positioning + bullets). Add nav link to `/visuals/task-list/` on help headers next to Gantt.

## Verify

- https://datalund.no/visuals/task-list/ → DataLund Task List **1.0.0.0**
- https://datalund.no/downloads/taskList.pbiviz → opens / downloads
- https://datalund.no/downloads/TaskListSampleData.xlsx → sample workbook
- Help page JSON-LD `softwareVersion` = `1.0.0.0`
- Cross-link to Gantt; no white-label / unbranded Task List on the site
