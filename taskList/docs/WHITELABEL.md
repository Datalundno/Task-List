# White-label — Task List (unbranded)

Personal / unbranded twin of **DataLund Task List**. Same behaviour; separate Power BI identity.

| | Branded | Unbranded |
| --- | --- | --- |
| Display name | DataLund Task List | **Task List** |
| GUID | `taskList77784F8F0C1B422C8E9B3087731D2FA7` | `taskListWL0AB47A35089145D284187DE56271318E` |
| Package file | `downloads/taskList.pbiviz` (committed) | local only — **gitignored** |
| Release tag | `v1.0.3.0` | `whitelabel-1.0.3.0` (optional personal release) |
| Website / AppSource | Yes | **No** |

## Build

From `taskList/` (uses branded `src/` + overlays in `whitelabel/`):

```bash
cd taskList
npm install
npm run package:whitelabel
```

Output: `downloads/TaskList.pbiviz` (not committed). Rebuild when you need it.

## Certification / AppSource rules

- The **`certification`** branch must contain **only** the branded GUID.
  Do not merge `whitelabel/` overlays or unbranded packages into that branch.
- Do **not** link the unbranded build from datalund.no or AppSource under DataLund.
- Keep the unbranded GUID stable once anyone has imported the personal visual.
- Feature changes land in branded source first; re-run `package:whitelabel` to refresh the twin.
