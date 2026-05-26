import { create } from "zustand";

export type LabelStyle = "A" | "1" | "i" | "ka" | "I" | "a";

export const LABEL_STYLES: { id: LabelStyle; name: string; render: (i: number) => string }[] = [
  { id: "A", name: "A · B · C", render: (i) => String.fromCharCode(65 + i) },
  { id: "a", name: "a · b · c", render: (i) => String.fromCharCode(97 + i) },
  { id: "1", name: "1 · 2 · 3", render: (i) => String(i + 1) },
  { id: "i", name: "i · ii · iii", render: (i) => ["i", "ii", "iii", "iv", "v", "vi"][i] ?? String(i + 1) },
  { id: "I", name: "I · II · III", render: (i) => ["I", "II", "III", "IV", "V", "VI"][i] ?? String(i + 1) },
  { id: "ka", name: "ক · খ · গ", render: (i) => ["ক", "খ", "গ", "ঘ", "ঙ", "চ"][i] ?? String(i + 1) },
];

export type ShapeKind =
  | "triangle"
  | "right-triangle"
  | "square"
  | "rectangle"
  | "circle"
  | "venn"
  | "arc"
  | "cube"
  | "pyramid"
  | "cylinder"
  | "axis"
  | "line"
  | "equation"
  | "text";

export interface CanvasItem {
  id: string;
  kind: ShapeKind;
  x: number; // 0..1
  y: number; // 0..1
  w: number; // 0..1
  h: number; // 0..1
  label?: string;
  rotation?: number;
}

export interface Option {
  id: string;
  text: string;
  correct?: boolean;
}

export type CanvasSize = "closed" | "half" | "full";

export type TickStyle = "label" | "green" | "side";

export interface Question {
  id: string;
  text: string;
  items: CanvasItem[];
  figureOpen: boolean;
  canvasSize: CanvasSize;
  options: Option[];
  labelStyle: LabelStyle;
  tickStyle: TickStyle;
  solution: string;
}

interface State {
  questions: Question[];
  currentId: string;
  selectedItemId: string | null;
  shapePickerOpen: boolean;
  solutionOpen: boolean;
  labelPickerOpen: boolean;
  optionsSettingsOpen: boolean;
  setCurrent: (id: string) => void;
  addQuestion: () => void;
  updateCurrent: (patch: Partial<Question>) => void;
  setOption: (id: string, patch: Partial<Option>) => void;
  reorderOptions: (ids: string[]) => void;
  addOption: () => void;
  removeOption: (id: string) => void;
  clearOptions: () => void;
  shuffleOptions: () => void;
  autoFillOptions: () => void;
  toggleFigure: () => void;
  cycleCanvasSize: () => void;
  shrinkCanvas: () => void;
  addItem: (kind: ShapeKind, label?: string) => void;
  updateItem: (id: string, patch: Partial<CanvasItem>) => void;
  removeItem: (id: string) => void;
  selectItem: (id: string | null) => void;
  setShapePicker: (v: boolean) => void;
  setSolutionOpen: (v: boolean) => void;
  setLabelPickerOpen: (v: boolean) => void;
  setOptionsSettingsOpen: (v: boolean) => void;
  setLabelStyle: (s: LabelStyle) => void;
  setTickStyle: (s: TickStyle) => void;
  setSolution: (s: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);

const blankQuestion = (): Question => ({
  id: uid(),
  text: "",
  items: [],
  figureOpen: false,
  canvasSize: "closed",
  labelStyle: "A",
  tickStyle: "label",
  solution: "",
  options: [
    { id: uid(), text: "" },
    { id: uid(), text: "" },
    { id: uid(), text: "" },
    { id: uid(), text: "" },
  ],
});

const initial: Question[] = Array.from({ length: 3 }, blankQuestion);

export const useMcq = create<State>((set, get) => ({
  questions: initial,
  currentId: initial[0].id,
  selectedItemId: null,
  shapePickerOpen: false,
  solutionOpen: false,
  labelPickerOpen: false,
  optionsSettingsOpen: false,
  setCurrent: (id) => set({ currentId: id, selectedItemId: null }),
  addQuestion: () => {
    const q = blankQuestion();
    set((s) => ({ questions: [...s.questions, q], currentId: q.id }));
  },
  updateCurrent: (patch) =>
    set((s) => ({
      questions: s.questions.map((q) => (q.id === s.currentId ? { ...q, ...patch } : q)),
    })),
  setOption: (id, patch) =>
    set((s) => ({
      questions: s.questions.map((q) =>
        q.id === s.currentId
          ? { ...q, options: q.options.map((o) => (o.id === id ? { ...o, ...patch } : o)) }
          : q,
      ),
    })),
  reorderOptions: (ids) =>
    set((s) => ({
      questions: s.questions.map((q) =>
        q.id === s.currentId
          ? { ...q, options: ids.map((id) => q.options.find((o) => o.id === id)!).filter(Boolean) }
          : q,
      ),
    })),
  addOption: () =>
    set((s) => ({
      questions: s.questions.map((q) =>
        q.id === s.currentId ? { ...q, options: [...q.options, { id: uid(), text: "" }] } : q,
      ),
    })),
  removeOption: (id) =>
    set((s) => ({
      questions: s.questions.map((q) =>
        q.id === s.currentId ? { ...q, options: q.options.filter((o) => o.id !== id) } : q,
      ),
    })),
  clearOptions: () =>
    set((s) => ({
      questions: s.questions.map((q) =>
        q.id === s.currentId
          ? { ...q, options: q.options.map((o) => ({ ...o, text: "", correct: false })) }
          : q,
      ),
    })),
  shuffleOptions: () =>
    set((s) => ({
      questions: s.questions.map((q) => {
        if (q.id !== s.currentId) return q;
        const arr = [...q.options];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return { ...q, options: arr };
      }),
    })),
  autoFillOptions: () => {
    const samples = ["Lorem ipsum", "Dolor sit amet", "Consectetur", "Adipiscing elit", "Sed do eiusmod", "Tempor incididunt"];
    set((s) => ({
      questions: s.questions.map((q) =>
        q.id === s.currentId
          ? {
              ...q,
              options: q.options.map((o, i) => ({
                ...o,
                text: samples[i % samples.length],
                correct: i === 0,
              })),
            }
          : q,
      ),
    }));
  },
  toggleFigure: () => {
    const q = get().questions.find((x) => x.id === get().currentId)!;
    get().updateCurrent({ figureOpen: !q.figureOpen });
  },
  cycleCanvasSize: () => {
    const q = get().questions.find((x) => x.id === get().currentId)!;
    const order: CanvasSize[] = ["closed", "half", "full"];
    const next = order[(order.indexOf(q.canvasSize) + 1) % order.length];
    get().updateCurrent({ canvasSize: next, figureOpen: next !== "closed" });
  },
  shrinkCanvas: () => {
    get().updateCurrent({ canvasSize: "closed", figureOpen: false });
  },
  addItem: (kind, label) => {
    const isText = kind === "text";
    const item: CanvasItem = {
      id: uid(),
      kind,
      x: isText ? 0.15 : 0.3,
      y: isText ? 0.1 : 0.3,
      w: isText ? 0.6 : 0.35,
      h: isText ? 0.12 : 0.35,
      label: isText ? (label ?? "Text") : label,
    };
    set((s) => ({
      questions: s.questions.map((q) =>
        q.id === s.currentId
          ? { ...q, items: [...q.items, item], figureOpen: true, canvasSize: q.canvasSize === "closed" ? "half" : q.canvasSize }
          : q,
      ),
      selectedItemId: item.id,
      shapePickerOpen: false,
    }));
  },
  updateItem: (id, patch) =>
    set((s) => ({
      questions: s.questions.map((q) =>
        q.id === s.currentId
          ? { ...q, items: q.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) }
          : q,
      ),
    })),
  removeItem: (id) =>
    set((s) => ({
      questions: s.questions.map((q) =>
        q.id === s.currentId ? { ...q, items: q.items.filter((it) => it.id !== id) } : q,
      ),
      selectedItemId: null,
    })),
  selectItem: (id) => set({ selectedItemId: id }),
  setShapePicker: (v) => set({ shapePickerOpen: v }),
  setSolutionOpen: (v) => set({ solutionOpen: v }),
  setLabelPickerOpen: (v) => set({ labelPickerOpen: v }),
  setOptionsSettingsOpen: (v) => set({ optionsSettingsOpen: v }),
  setLabelStyle: (s) => get().updateCurrent({ labelStyle: s }),
  setTickStyle: (s) => get().updateCurrent({ tickStyle: s }),
  setSolution: (s) => get().updateCurrent({ solution: s }),
}));

export const useCurrentQuestion = () => {
  const id = useMcq((s) => s.currentId);
  return useMcq((s) => s.questions.find((q) => q.id === id)!);
};
