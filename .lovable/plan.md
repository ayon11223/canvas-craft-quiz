# PDF Preview & Export — textbook style

Goal: a Preview tab that renders all questions paginated exactly as they will export to PDF, matching the Bengali textbook style in the reference (numbered questions, lettered options, correct option marked per current tickStyle, dense multi-column layout). User can tune layout from a new Project Settings sheet.

## 1. Project Settings store

Extend `src/lib/mcq-store.ts` with a `projectSettings` slice (persisted in localStorage so it survives reload):

```ts
interface ProjectSettings {
  pageSize: "A4" | "Letter" | "Legal";
  orientation: "portrait" | "landscape";
  margin: number;          // mm, 5–30
  columns: 1 | 2 | 3;
  columnGap: number;       // mm
  fontFamily: string;      // "Noto Serif Bengali" | "SolaimanLipi" | "Kalpurush" | system
  fontSize: number;        // pt, 9–14
  lineHeight: number;      // 1.2–1.8
  questionNumberStyle: "১২৩" | "123" | "1." | "Q1.";
  optionLabelStyle: LabelStyle; // reuse existing
  showHeader: boolean;
  headerText: string;      // doc title
  showFooter: boolean;
  footerText: string;
  showPageNumbers: boolean;
  pageNumberFormat: "১" | "1" | "Page 1" | "1 / N";
}
```

New action `updateProjectSettings(patch)`. History-tracked.

## 2. New `PrintPreview` component (`src/components/mcq/PrintPreview.tsx`)

Full-screen overlay sheet (canvas-paper theme, drag-to-dismiss like the other pickers). Contents:

- Toolbar: close, zoom −/+, page indicator (`3 / 7`), `Export PDF` button, `Settings` button (opens Project Settings sheet).
- Scrollable area with one `<div class="pdf-page">` per page, each sized to the configured page size at print scale (CSS `mm` units, white bg, soft shadow, centered).
- Pages auto-paginate: render all questions into a CSS multi-column flow per page; use a measurement pass to split questions across pages (see Technical notes).

Each rendered question:

```
১।  {question text or figure}
    (ক) option a       (খ) option b
    (গ) option c       (ঘ) option d
```

- The "correct" option's label is wrapped per the question's `tickStyle`:
  - `label`: label shown plain (no mark)
  - `green`: label rendered with green text
  - `side`: small ✓ printed next to the option
  - `none`: no mark
  - default for textbook style is `label` with a circle — we'll add `tickStyle="circle"` so users who want the reference look can pick it from the in-app tick menu. The circle fills behind the label in dark ink.
- Canvas figures (items array) render as inline SVG at the top of the question, scaled to column width.
- Footer / Note line under question if present.

## 3. Pagination

For accuracy without a heavy PDF engine:

1. Render all questions off-screen in a hidden container at the same column width.
2. Measure each question's height with `getBoundingClientRect`.
3. Greedy-pack into columns and pages based on `pageHeight - margins - header - footer`.
4. Re-run pagination on settings change, questions change, or container resize (debounced).

## 4. Export PDF

Use `window.print()` with a dedicated `@media print` stylesheet that hides app chrome and renders the pages at real page size. Add a `?print=1` route variant later if needed, but `window.print()` from the preview overlay is enough for v1 (user picks "Save as PDF" in the OS dialog). No new heavy dependency.

If the user later wants direct PDF download, swap in `html2pdf.js` — wire-up isolated to `exportPdf()` in `PrintPreview`.

## 5. Project Settings sheet (`src/components/mcq/ProjectSettings.tsx`)

Drag-to-dismiss sheet matching the other pickers. Sections:

- Page: size (A4/Letter/Legal), orientation, margins (slider mm)
- Layout: columns (1/2/3), column gap, font family, font size, line height
- Numbering: question number style, option label style
- Header/Footer: toggles + text inputs, page number format

Live-updates the preview while open.

## 6. Wire into BottomToolbar

In `src/components/mcq/BottomToolbar.tsx`, replace the Preview and Project stubs:

```ts
{ icon: Eye, label: "Preview", onClick: () => setPreviewOpen(true) },
{ icon: SlidersHorizontal, label: "Project", onClick: () => setProjectSettingsOpen(true) },
```

Add `previewOpen` and `projectSettingsOpen` flags + setters to the store. Mount `<PrintPreview />` and `<ProjectSettings />` in `src/routes/index.tsx` alongside the other sheets.

## 7. tickStyle additions

Add `"circle"` to the `TickStyle` union (reference image style — dark filled circle behind the correct option label). Update the in-app `OptionsList` rendering AND the print renderer to honor it, so what the user sees on-canvas matches the PDF.

## Technical notes

- Fonts: load Noto Serif Bengali via Google Fonts in `index.html` (already may be present — verify; add if missing) so Bengali renders correctly both on screen and in print.
- Print CSS lives in `src/styles.css` under `@media print` — hide everything except the `.pdf-export-root` container.
- Pagination measurement runs in a `useLayoutEffect` with a `ResizeObserver` on the hidden measurement container.
- Persisted settings: small `zustand/middleware` `persist` wrapper, key `mcq-project-settings`.
- No backend changes.

## Out of scope (this pass)

- Direct binary PDF download (rely on browser Save-as-PDF).
- Per-question overrides of layout.
- Cover page / answer key page (can add later as new settings flags).
