# Task List (unbranded)

White-label Power BI visual — personal / unbranded only.

| | Value |
| --- | --- |
| Display name | **Task List** |
| GUID | `taskListWL0AB47A35089145D284187DE56271318E` |
| Version | 1.0.3.0 |
| Package | `../downloads/TaskList.pbiviz` (gitignored — build locally) |

**Do not** publish this build on datalund.no or AppSource under the DataLund brand.
Do **not** include this folder on the lowercase `certification` branch.

Same behaviour as the branded visual: browse + select rows, RAG chips, progress, density presets, selection-based cross-filtering.

```bash
# from taskList/
npm run package:whitelabel
```
