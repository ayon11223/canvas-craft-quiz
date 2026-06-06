import { create } from "zustand";
import { useMcq, type Question } from "./mcq-store";

export interface DocSnapshot {
  questions: Question[];
  currentId: string;
}

interface HistoryState {
  past: DocSnapshot[];
  future: DocSnapshot[];
  lastLabel: string | null;
  lastTime: number;
  _bump: number; // forces re-renders for canUndo/canRedo selectors
}

const MAX = 100;
const COALESCE_MS = 600;

export const useHistory = create<HistoryState>(() => ({
  past: [],
  future: [],
  lastLabel: null,
  lastTime: 0,
  _bump: 0,
}));

function snapshot(): DocSnapshot {
  const s = useMcq.getState();
  return {
    questions: structuredClone(s.questions),
    currentId: s.currentId,
  };
}

export function pushHistory(label: string = "edit") {
  const now = Date.now();
  const h = useHistory.getState();
  // Coalesce consecutive same-label pushes within window — keep only the
  // earlier snapshot so undo jumps to before the burst started.
  if (h.lastLabel === label && now - h.lastTime < COALESCE_MS && h.past.length > 0) {
    useHistory.setState({ lastTime: now, future: [], _bump: h._bump + 1 });
    return;
  }
  const snap = snapshot();
  const past = [...h.past, snap];
  if (past.length > MAX) past.shift();
  useHistory.setState({
    past,
    future: [],
    lastLabel: label,
    lastTime: now,
    _bump: h._bump + 1,
  });
}

export function undo() {
  const h = useHistory.getState();
  if (h.past.length === 0) return;
  const current = snapshot();
  const prev = h.past[h.past.length - 1];
  useHistory.setState({
    past: h.past.slice(0, -1),
    future: [...h.future, current],
    lastLabel: null,
    lastTime: 0,
    _bump: h._bump + 1,
  });
  useMcq.getState()._applySnapshot(prev);
}

export function redo() {
  const h = useHistory.getState();
  if (h.future.length === 0) return;
  const current = snapshot();
  const next = h.future[h.future.length - 1];
  useHistory.setState({
    past: [...h.past, current],
    future: h.future.slice(0, -1),
    lastLabel: null,
    lastTime: 0,
    _bump: h._bump + 1,
  });
  useMcq.getState()._applySnapshot(next);
}

export const useCanUndo = () => useHistory((s) => s.past.length > 0);
export const useCanRedo = () => useHistory((s) => s.future.length > 0);
