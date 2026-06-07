import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { useMcq } from "@/lib/mcq-store";
import { LABEL_STYLES, type LabelStyle } from "@/lib/mcq-store";
import {
  useProjectSettings,
  type PageSize,
  type Orientation,
  type QNumberStyle,
  type PageNumFormat,
} from "@/lib/project-settings";

const PAGE_SIZES: PageSize[] = ["A4", "Letter", "Legal"];
const FONTS = [
  { id: "'Noto Serif Bengali', 'Hind Siliguri', serif", name: "Noto Serif (Bangla)" },
  { id: "'Hind Siliguri', 'Noto Serif Bengali', sans-serif", name: "Hind Siliguri (Bangla)" },
  { id: "'Inter', system-ui, sans-serif", name: "Inter" },
  { id: "Georgia, 'Times New Roman', serif", name: "Georgia" },
];
const Q_STYLES: { id: QNumberStyle; name: string }[] = [
  { id: "bn", name: "১। ২। ৩।" },
  { id: "en", name: "1. 2. 3." },
  { id: "en-dot", name: "1) 2) 3)" },
  { id: "en-q", name: "Q1. Q2." },
];
const PN_STYLES: { id: PageNumFormat; name: string }[] = [
  { id: "bn", name: "১" },
  { id: "en", name: "1" },
  { id: "page-en", name: "Page 1" },
  { id: "x-of-n", name: "1 / N" },
];

export function ProjectSettings() {
  const { projectSettingsOpen, setProjectSettingsOpen } = useMcq();
  const { settings, update, reset } = useProjectSettings();

  const close = () => setProjectSettingsOpen(false);
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) close();
  };

  return (
    <AnimatePresence>
      {projectSettingsOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[70] canvas-paper rounded-t-3xl shadow-pop pb-[env(safe-area-inset-bottom)] max-h-[88vh] flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={onDragEnd}
          >
            <div className="mx-auto mt-2 mb-2 h-1.5 w-12 rounded-full bg-canvas-foreground/20 shrink-0" />
            <div className="px-5 pt-1 pb-5 overflow-y-auto">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-semibold text-base text-canvas-foreground">
                    Project Settings
                  </h3>
                  <p className="text-xs text-canvas-foreground/60 mt-0.5">
                    Configure how the PDF export looks.
                  </p>
                </div>
                <button
                  onClick={close}
                  aria-label="Close"
                  className="size-9 rounded-full border border-canvas-foreground/15 grid place-items-center text-canvas-foreground/70 shrink-0"
                >
                  <X className="size-4" />
                </button>
              </div>

              <Section title="Page">
                <Chips
                  value={settings.pageSize}
                  options={PAGE_SIZES.map((p) => ({ id: p, name: p }))}
                  onChange={(v) => update({ pageSize: v as PageSize })}
                />
                <Chips
                  value={settings.orientation}
                  options={[
                    { id: "portrait", name: "Portrait" },
                    { id: "landscape", name: "Landscape" },
                  ]}
                  onChange={(v) => update({ orientation: v as Orientation })}
                />
                <Slider
                  label="Margin"
                  unit="mm"
                  value={settings.margin}
                  min={5}
                  max={30}
                  step={1}
                  onChange={(v) => update({ margin: v })}
                />
              </Section>

              <Section title="Layout">
                <Chips
                  value={String(settings.columns)}
                  options={[
                    { id: "1", name: "1 column" },
                    { id: "2", name: "2 columns" },
                    { id: "3", name: "3 columns" },
                  ]}
                  onChange={(v) => update({ columns: Number(v) as 1 | 2 | 3 })}
                />
                <Slider
                  label="Column gap"
                  unit="mm"
                  value={settings.columnGap}
                  min={2}
                  max={20}
                  step={1}
                  onChange={(v) => update({ columnGap: v })}
                />
                <SelectRow
                  label="Font family"
                  value={settings.fontFamily}
                  options={FONTS}
                  onChange={(v) => update({ fontFamily: v })}
                />
                <Slider
                  label="Font size"
                  unit="pt"
                  value={settings.fontSize}
                  min={8}
                  max={16}
                  step={1}
                  onChange={(v) => update({ fontSize: v })}
                />
                <Slider
                  label="Line height"
                  unit=""
                  value={settings.lineHeight}
                  min={1.1}
                  max={2}
                  step={0.05}
                  onChange={(v) => update({ lineHeight: Math.round(v * 100) / 100 })}
                />
              </Section>

              <Section title="Numbering & labels">
                <RowLabel>Question number</RowLabel>
                <Chips
                  value={settings.questionNumberStyle}
                  options={Q_STYLES}
                  onChange={(v) => update({ questionNumberStyle: v as QNumberStyle })}
                />
                <RowLabel>Option labels</RowLabel>
                <Chips
                  value={settings.optionLabelStyle}
                  options={LABEL_STYLES.map((s) => ({ id: s.id, name: s.name }))}
                  onChange={(v) => update({ optionLabelStyle: v as LabelStyle })}
                />
              </Section>

              <Section title="Header & Footer">
                <Toggle
                  label="Show header"
                  value={settings.showHeader}
                  onChange={(v) => update({ showHeader: v })}
                />
                {settings.showHeader && (
                  <TextInput
                    placeholder="Document title"
                    value={settings.headerText}
                    onChange={(v) => update({ headerText: v })}
                  />
                )}
                <Toggle
                  label="Show footer text"
                  value={settings.showFooter}
                  onChange={(v) => update({ showFooter: v })}
                />
                {settings.showFooter && (
                  <TextInput
                    placeholder="Footer text"
                    value={settings.footerText}
                    onChange={(v) => update({ footerText: v })}
                  />
                )}
                <Toggle
                  label="Page numbers"
                  value={settings.showPageNumbers}
                  onChange={(v) => update({ showPageNumbers: v })}
                />
                {settings.showPageNumbers && (
                  <Chips
                    value={settings.pageNumberFormat}
                    options={PN_STYLES}
                    onChange={(v) => update({ pageNumberFormat: v as PageNumFormat })}
                  />
                )}
              </Section>

              <button
                onClick={reset}
                className="mt-5 w-full text-xs text-canvas-foreground/60 hover:text-canvas-foreground py-2"
              >
                Reset to defaults
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-canvas-foreground/50 mb-2">
        {title}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function RowLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-canvas-foreground/70 mt-1">{children}</div>;
}

function Chips({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { id: string; name: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              active
                ? "bg-canvas-foreground text-canvas"
                : "bg-canvas-foreground/5 text-canvas-foreground/80 hover:bg-canvas-foreground/10"
            }`}
          >
            {o.name}
          </button>
        );
      })}
    </div>
  );
}

function Slider({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-canvas-foreground/80 mb-1">
        <span>{label}</span>
        <span className="tabular-nums">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-canvas-foreground"
      />
    </div>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { id: string; name: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-xs text-canvas-foreground/80 mb-1">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-canvas-foreground/5 border border-canvas-foreground/15 rounded-lg px-3 py-2 text-sm text-canvas-foreground"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 bg-canvas-foreground/5 hover:bg-canvas-foreground/10 transition"
    >
      <span className="text-sm text-canvas-foreground">{label}</span>
      <span
        className={`w-9 h-5 rounded-full p-0.5 transition ${
          value ? "bg-canvas-foreground" : "bg-canvas-foreground/20"
        }`}
      >
        <span
          className={`block w-4 h-4 rounded-full bg-canvas transition ${
            value ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-canvas-foreground/5 border border-canvas-foreground/15 rounded-lg px-3 py-2 text-sm text-canvas-foreground placeholder:text-canvas-foreground/40"
    />
  );
}
