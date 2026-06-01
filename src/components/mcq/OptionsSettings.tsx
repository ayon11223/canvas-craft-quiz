import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ListChecks,
  Sigma,
  CheckCircle2,
  Eraser,
  ClipboardPaste,
  FileText,
  Image as ImageIcon,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import { useCurrentQuestion, useMcq, type TickStyle } from "@/lib/mcq-store";

const TICK_OPTIONS: { id: TickStyle; name: string; desc: string }[] = [
  { id: "none", name: "No tick (default)", desc: "Hide tick until solution is shown" },
  { id: "label", name: "On the label", desc: "Check mark replaces A · B · C" },
  { id: "green", name: "Highlight green", desc: "Whole option turns green" },
  { id: "side", name: "Side badge", desc: "Small tick on the right" },
];

export function OptionsSettings() {
  const { optionsSettingsOpen, setOptionsSettingsOpen, setLabelPickerOpen, clearOptions, setTickStyle, cycleCanvasSize, addItem } = useMcq();
  const q = useCurrentQuestion();
  const [tickOpen, setTickOpen] = useState(false);

  const close = () => {
    setOptionsSettingsOpen(false);
    setTickOpen(false);
  };

  const items = [
    {
      icon: ListChecks,
      label: "Choice type",
      hint: q.labelStyle,
      onClick: () => {
        close();
        setLabelPickerOpen(true);
      },
    },
    {
      icon: Sigma,
      label: "Equations",
      hint: "Coming soon",
      onClick: () => {},
    },
    {
      icon: CheckCircle2,
      label: "Tick mark",
      hint: TICK_OPTIONS.find((t) => t.id === q.tickStyle)?.name,
      onClick: () => setTickOpen((v) => !v),
      expanded: tickOpen,
    },
    {
      icon: ImageIcon,
      label: "Add image",
      hint: "Expands canvas",
      onClick: () => {
        if (q.canvasSize === "closed") cycleCanvasSize();
        addItem("text", "Image");
        close();
      },
    },
    {
      icon: Eraser,
      label: "Clear all",
      hint: "Reset choices",
      destructive: true,
      onClick: () => {
        clearOptions();
        close();
      },
    },
    {
      icon: ClipboardPaste,
      label: "Paste",
      hint: "Coming soon",
      onClick: () => {},
    },
    {
      icon: FileText,
      label: "Question format",
      hint: "Coming soon",
      onClick: () => {},
    },
  ];

  return (
    <AnimatePresence>
      {optionsSettingsOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-pop pb-[env(safe-area-inset-bottom)] max-h-[85vh] flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <div className="mx-auto mt-2 mb-1 h-1.5 w-12 rounded-full bg-muted-foreground/30 shrink-0" />
            <div className="px-5 pt-2 pb-5 overflow-y-auto">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-semibold text-base">Choice settings</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure how this question's answers look and behave.
                  </p>
                </div>
                <button
                  onClick={close}
                  aria-label="Close"
                  className="size-9 -mt-1 -mr-1 rounded-full grid place-items-center text-muted-foreground hover:text-foreground hover:bg-secondary shrink-0"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="mt-4 space-y-1.5">
                {items.map((it) => (
                  <div key={it.label}>
                    <button
                      onClick={it.onClick}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                        it.destructive
                          ? "bg-destructive/10 hover:bg-destructive/20 text-destructive"
                          : "bg-secondary/50 hover:bg-secondary"
                      }`}
                    >
                      <span
                        className={`size-9 rounded-lg grid place-items-center shrink-0 ${
                          it.destructive ? "bg-destructive/20" : "bg-background"
                        }`}
                      >
                        <it.icon className="size-4" />
                      </span>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium">{it.label}</div>
                        {it.hint && (
                          <div className="text-[11px] text-muted-foreground">{it.hint}</div>
                        )}
                      </div>
                      <ChevronRight
                        className={`size-4 text-muted-foreground transition ${
                          it.expanded ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                    {it.label === "Tick mark" && (
                      <AnimatePresence>
                        {tickOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-12 pr-2 py-2 space-y-1">
                              {TICK_OPTIONS.map((t) => {
                                const active = t.id === q.tickStyle;
                                return (
                                  <button
                                    key={t.id}
                                    onClick={() => {
                                      setTickStyle(t.id);
                                      setTickOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2 transition ${
                                      active
                                        ? "bg-primary/15 ring-1 ring-primary/40"
                                        : "hover:bg-secondary/60"
                                    }`}
                                  >
                                    <div className="text-left">
                                      <div className="text-sm">{t.name}</div>
                                      <div className="text-[11px] text-muted-foreground">
                                        {t.desc}
                                      </div>
                                    </div>
                                    {active && <Check className="size-4 text-primary" />}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
