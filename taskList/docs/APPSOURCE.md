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

## Assets to prepare

| Asset | Spec |
| --- | --- |
| Logo | 300×300 PNG (`assets/store/logo-300.png`) |
| Screenshot | 1366×768 PNG showing the list with RAG + progress |
| Sample `.pbix` | Optional for v1; bind sample Excel |

## Listing copy (draft)

- **Title:** DataLund Task List
- **Short description:** Browse and select projects with RAG status and progress.
- **Support URL:** https://datalund.no/support/
- **Privacy URL:** https://datalund.no/privacy/
- **Website:** https://datalund.no/visuals/task-list/

## Certification notes

- Empty `privileges` array
- No external network requests
- Landing page when no fields bound
- Context menu on empty space and rows
- Keyboard focus supported (`supportsKeyboardFocus`)
