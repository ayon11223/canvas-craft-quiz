## Changes

### 1. `src/components/mcq/SolutionPanel.tsx`
- Remove the "+ Add another choice" button and the unused `addOption` import. Keep the Add Solution toggle and panel intact.

### 2. `src/components/mcq/OptionsList.tsx`
- Remove the `Type` ("T") icon button from the header row in the choices section, plus its `Type` import. Leave Shuffle, Auto-Fill, and the Settings gear in place. Font/text styling will be handled by the bottom navigation Font tab (no new wiring required for this task).

### 3. `src/lib/mcq-store.ts`
- Add a `footer: string` field to `Question` (default `""`) so the canvas footer text persists per question. No other store changes.

### 4. `src/components/mcq/QuestionCanvas.tsx`
- When `q.canvasSize === "full"`, render a footer input pinned to the bottom of the canvas paper (above the existing centered expand/close controls, with a small left/right inset so it doesn't collide with them). It binds to `q.footer` via `updateCurrent({ footer })`, uses canvas-foreground styling, placeholder "Footer / note (e.g. Source, Marks: 2)…", and is hidden in `closed` and `half` states.
- Mark the footer with `data-no-swipe` so horizontal swipes inside it don't change slides.

No other files are touched. Choice-settings sheet keeps "Add another choice" handling implicit (already has Clear all, etc.); we are not adding a new entry there in this turn since the user said it "will be addressed from the choice setting" as the conceptual home — flagging in case you want me to also surface an explicit "Add choice" row inside OptionsSettings now.