# AppSource checklist — DataLund Task List

Mirror of the Gantt AppSource packaging steps, adapted for Task List.

## Package

```bash
cd taskList
npm install
npm run lint
npx pbiviz package
npx pbiviz package --certification-audit
cp dist/*.pbiviz downloads/taskList.pbiviz
```

Submit the package from the lowercase **`certification`** branch (source must match the uploaded `.pbiviz`).

## Assets to prepare

| Asset | Spec | Status |
| --- | --- | --- |
| Pane icon | PNG in `assets/icon.png` (small) | Present |
| Store logo | 300×300 PNG (`assets/store/logo-300.png`) | Present |
| Screenshot | 1366×768 PNG showing the list with RAG + progress | Prepare in Partner Center |
| Sample `.pbix` | Optional for v1; bind sample Excel | Optional |
| Privacy URL | https://datalund.no/privacy/ | In `pbiviz.json` + docs |
| Support URL | https://datalund.no/support/ | In `pbiviz.json` |
| Author email | `support@datalund.no` | In `pbiviz.json` |

## Listing copy (draft)

- **Title:** DataLund Task List
- **Short description:** Browse and select projects with RAG status and progress.
- **Support URL:** https://datalund.no/support/
- **Privacy URL:** https://datalund.no/privacy/
- **Website:** https://datalund.no/visuals/task-list/

## Certification notes

See [`CERTIFICATION.md`](CERTIFICATION.md) for rendering events, selection vs filter,
privileges, and single-GUID rules.

- Empty `privileges` array
- No external network requests
- Landing page when no fields bound
- Context menu on empty space and rows
- Keyboard focus supported (`supportsKeyboardFocus`)
- Locales: `en-US`, `nb-NO`
