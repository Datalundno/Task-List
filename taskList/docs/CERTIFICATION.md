# Certification notes — DataLund Task List

Checklist and product decisions for AppSource / Power BI custom visual certification.

## Rendering events

`taskList/src/visual.ts` wires `IVisualEventService`:

- `events.renderingStarted(options)` at the start of `update()`
- Exactly one of `renderingFinished` / `renderingFailed` on every exit path

## Selection vs Filter API (product decision)

**Intent: selection / cross-highlight, not a slicer-like DAX filter.**

Rows use `ISelectionManager.select` / `clear` / `showContextMenu` and
`registerOnSelectCallback` for bookmarks. There is **no** `applyJsonFilter`,
no `general.filter` object in `capabilities.json`, and no
`supportsSynchronizingFilterState`.

README “cross-filter” means Power BI’s built-in selection → highlight / filter
other visuals behavior — the same path as most certified list/chart visuals.

Do **not** add the Filter API unless product intent changes to “this visual is a slicer.”

## Privileges & network

- `capabilities.json` → `"privileges": []`
- `pbiviz.json` → `"externalJS": null`
- No `fetch` / `XMLHttpRequest` / `WebSocket` / `eval` / `innerHTML` in `src/`
- User strings go through d3 `.text()` / SVG `text` nodes

## Single visual identity (branded)

| Build | GUID |
| --- | --- |
| **Branded (this package / AppSource)** | `taskList77784F8F0C1B422C8E9B3087731D2FA7` |

The personal white-label overlay (`whitelabel/`, different GUID) is **build-time
only** and must **not** be present on the `certification` branch or in AppSource
submission artifacts. Packaged unbranded `.pbiviz` files are gitignored — never
commit them next to the branded package.

## Formatting model

Uses modern `getFormattingModel()` + `FormattingSettingsService`
(`powerbi-visuals-utils-formattingmodel`). No deprecated
`enumerateObjectInstances`.

## High contrast & keyboard

- `utils/contrast.ts` reads `colorPalette.isHighContrast` (+ fg/bg/selected)
- Root has `tabindex="0"`, listbox semantics; arrow / Enter / Space / Esc navigate
  and select rows when focus is in the visual

## Package / audit commands

```bash
cd taskList
npm install
npm run lint
npx pbiviz package
npx pbiviz package --certification-audit
```

Ship only `downloads/taskList.pbiviz` (branded) from this repo.
