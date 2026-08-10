# White-label — Task List (unbranded)

Personal / unbranded twin of **DataLund Task List**. Same behaviour; separate Power BI identity.

| | Branded | Unbranded |
| --- | --- | --- |
| Display name | DataLund Task List | **Task List** |
| GUID | `taskList77784F8F0C1B422C8E9B3087731D2FA7` | `taskListWL0AB47A35089145D284187DE56271318E` |
| Package file | `downloads/taskList.pbiviz` | `downloads/TaskList.pbiviz` |
| Release tag | `v1.0.0.0` | `whitelabel-1.0.0.0` |
| Website | Yes (`datalund.no`) | **No** |

## Build

From `taskList/` (uses branded `src/` + overlays in [`../whitelabel/`](../whitelabel/) — path: `taskList/whitelabel/`):

```bash
cd taskList
npm install
npm run package:whitelabel
```

## Rules

- Do **not** link the unbranded build from datalund.no or AppSource under DataLund.
- Keep the GUID stable once anyone has imported the personal visual.
- Feature changes land in branded source first; re-run `package:whitelabel` to refresh the twin.
