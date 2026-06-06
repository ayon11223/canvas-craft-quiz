# Undo / Redo (Canva-style)

Add a global undo/redo system that captures meaningful document edits and lets users step backward/forward through them via the top toolbar buttons and keyboard shortcuts.

## Scope

What gets undone/redone (everything that mutates `questions`):

- Typing in the question text, footer, solution, table cells, text-box labels (debounced — one history entry per "burst" of typing, not per keystroke).
- Moving/resizing canvas items (one entry per drag, captured on pointer-up — not per intermediate frame).
- Adding/removing/duplicating items, shapes, equations, text boxes, tables.
- Adding/removing/duplicating options and questions.
- Label style, tick style, canvas size changes.
- Bulk slide actions from the grid view (delete/duplicate/reorder multiple).

Out of scope (transient UI, not document state):

- Which slide is current, selection, open/closed menus & sheets, scroll position.

## UX

- Top toolbar `Undo2` / `Redo2` icons already exist — wire them up. Disable (40% opacity) when respective stack is empty.
- Keyboard: `Ctrl/Cmd+Z` = undo, `Ctrl/Cmd+Shift+Z` and `Ctrl/Cmd+Y` = redo. Ignored when focus is in an input AND the input would handle it natively? No — Canva intercepts globally so users can undo their typing too. We intercept globally.
- Optional small toast on undo/redo showing the action label (skip for v1 to keep it quiet).

## Technical design

### History store (new file `src/lib/history.ts`)

A separate Zustand store holding:

```
past:   DocSnapshot[]   // newest at end
future: DocSnapshot[]
```

`DocSnapshot = { questions: Question[]; currentId: string }` (deep-cloned via `structuredClone`).

API:

- `pushHistory(label?: string)` — snapshot current doc state, push to `past`, clear `future`. Coalesces consecutive pushes with the same label within 600ms (used for typing bursts).
- `undo()` / `redo()` — swap snapshots into the mcq store via a new `useMcq.getState()._applySnapshot(snap)` action.
- `canUndo()` / `canRedo()` selectors.

### MCQ store changes (`src/lib/mcq-store.ts`)

- Add `_applySnapshot(snap)` action that replaces `questions` + `currentId` without touching transient UI flags.
- Wrap mutating actions to call `pushHistory(label)` BEFORE mutation. Centralize via a small helper `withHistory(label, fn)` to avoid repetition.
- For typing-style actions (`updateCurrent` when patching `text`/`footer`/`solution`, `setOption`, `updateItemCell`, `updateItem` with only `label`) pass a label like `"type:text"`, `"type:option:<id>"` so coalescing only merges same-field bursts.
- For drag/resize: `updateItem` with x/y/w/h is called every pointer-move frame. Two options:
  1. Push history only at drag start (preferred — capture a `"drag:<id>"` snapshot once, debounce subsequent x/y/w/h patches under that label within 1500ms so the whole drag = 1 entry).
  2. Or add explicit `beginInteraction()` / `endInteraction()` calls in `QuestionCanvas` `startDrag`. Cleaner — we'll do this: call `pushHistory("move")` inside `startDrag` once before `onMove` registers, and skip auto-push for x/y/w/h-only patches.

### Wiring

- `TopBar.tsx` — bind `Undo2`/`Redo2` onClicks to `undo()`/`redo()`; read `canUndo/canRedo` for disabled state.
- `routes/__root.tsx` (or new `useKeyboardShortcuts` hook mounted in `routes/index.tsx`) — add global keydown listener for the shortcuts.
- `QuestionCanvas.tsx` `startDrag` — call `pushHistory("drag")` once at start.

### Files touched

- New: `src/lib/history.ts`
- Edit: `src/lib/mcq-store.ts` (add `_applySnapshot`, wrap mutators)
- Edit: `src/components/mcq/TopBar.tsx` (wire buttons + disabled state)
- Edit: `src/components/mcq/QuestionCanvas.tsx` (push history at drag start; skip for in-progress frames)
- Edit: `src/routes/index.tsx` (global keyboard shortcut listener)

### Notes / limits

- History capped at 100 entries (drop oldest).
- Snapshots use `structuredClone` — Question shape is plain JSON, safe.
- Memory: ~100 × small JSON ≈ negligible.
- No persistence across reload (matches Canva's session-only undo).