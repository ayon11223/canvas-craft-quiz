import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LabelStyle } from "./mcq-store";

export type PageSize = "A4" | "Letter" | "Legal";
export type Orientation = "portrait" | "landscape";
export type QNumberStyle = "bn" | "en" | "en-dot" | "en-q";
export type PageNumFormat = "bn" | "en" | "page-en" | "x-of-n";

// mm dimensions
export const PAGE_DIMS: Record<PageSize, { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  Letter: { w: 216, h: 279 },
  Legal: { w: 216, h: 356 },
};

export interface ProjectSettings {
  pageSize: PageSize;
  orientation: Orientation;
  margin: number; // mm
  columns: 1 | 2 | 3;
  columnGap: number; // mm
  fontFamily: string;
  fontSize: number; // pt
  lineHeight: number;
  questionNumberStyle: QNumberStyle;
  optionLabelStyle: LabelStyle;
  showHeader: boolean;
  headerText: string;
  showFooter: boolean;
  footerText: string;
  showPageNumbers: boolean;
  pageNumberFormat: PageNumFormat;
}

export const DEFAULT_SETTINGS: ProjectSettings = {
  pageSize: "A4",
  orientation: "portrait",
  margin: 15,
  columns: 2,
  columnGap: 8,
  fontFamily: "'Noto Serif Bengali', 'Hind Siliguri', serif",
  fontSize: 11,
  lineHeight: 1.45,
  questionNumberStyle: "bn",
  optionLabelStyle: "ka",
  showHeader: true,
  headerText: "Question Paper",
  showFooter: false,
  footerText: "",
  showPageNumbers: true,
  pageNumberFormat: "x-of-n",
};

interface State {
  settings: ProjectSettings;
  update: (patch: Partial<ProjectSettings>) => void;
  reset: () => void;
}

export const useProjectSettings = create<State>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      update: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      reset: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    { name: "mcq-project-settings" },
  ),
);

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const toBn = (n: number) => String(n).split("").map((d) => (/\d/.test(d) ? BN_DIGITS[+d] : d)).join("");

export function formatQNumber(n: number, style: QNumberStyle) {
  switch (style) {
    case "bn": return `${toBn(n)}।`;
    case "en": return `${n}.`;
    case "en-dot": return `${n})`;
    case "en-q": return `Q${n}.`;
  }
}

export function formatPageNum(n: number, total: number, fmt: PageNumFormat) {
  switch (fmt) {
    case "bn": return toBn(n);
    case "en": return String(n);
    case "page-en": return `Page ${n}`;
    case "x-of-n": return `${n} / ${total}`;
  }
}
