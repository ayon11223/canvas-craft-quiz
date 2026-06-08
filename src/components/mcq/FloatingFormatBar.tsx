import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useCurrentQuestion, useMcq, FONT_FAMILIES, DEFAULT_TEXT_STYLE, type TextAlign } from "@/lib/mcq-store";

function isEditable(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "TEXTAREA") return true;
  if (tag === "INPUT") {
    const t = (el as HTMLInputElement).type;
    return ["text", "search", "url", "email", ""].includes(t);
  }
  return false;
}

export function FloatingFormatBar() {
  const q = useCurrentQuestion();
  const { setStyle } = useMcq();
  const style = { ...DEFAULT_TEXT_STYLE, ...(q.style ?? {}) };
  const [visible, setVisible] = useState(false);
  const [fontOpen, setFontOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as Element | null;
      if (!isEditable(t)) return;
      // Only show for fields inside the main editor area (skip toolbars/menus).
      if (t && (t.closest("[data-no-format]") || t.closest('[role="dialog"]'))) return;
      setVisible(true);
    };
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget as Element | null;
      // Keep visible if focus moves into the bar itself.
      if (next && barRef.current?.contains(next)) return;
      // Delay to allow click on bar buttons.
      setTimeout(() => {
        const a = document.activeElement;
        if (!isEditable(a) || (a && barRef.current?.contains(a))) {
          setVisible(false);
          setFontOpen(false);
        }
      }, 120);
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  // Prevent buttons from stealing focus from the active editor.
  const noBlur = (fn: () => void) => (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    fn();
  };

  const setAlign = (a: TextAlign) => setStyle({ align: a });
  const bumpSize = (delta: number) =>
    setStyle({ fontSize: Math.max(8, Math.min(48, style.fontSize + delta)) });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={barRef}
          initial={{ y: 16, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 16, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 360, damping: 28 }}
          data-no-swipe
          data-no-format
          className="fixed left-1/2 -translate-x-1/2 z-40 bg-card border border-border rounded-2xl shadow-pop px-2 py-1.5 flex items-center gap-1 max-w-[96vw] overflow-x-auto no-scrollbar"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 130px)" }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* Font family */}
          <div className="relative">
            <button
              onMouseDown={noBlur(() => setFontOpen((v) => !v))}
              className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium hover:bg-secondary/60 min-w-[90px] justify-between"
              style={{ fontFamily: style.fontFamily }}
            >
              <span className="truncate">{style.fontFamily}</span>
              <ChevronDown className="size-3 opacity-60" />
            </button>
            {fontOpen && (
              <div className="absolute bottom-full mb-1 left-0 bg-popover border border-border rounded-md shadow-pop py-1 min-w-[160px] max-h-60 overflow-y-auto z-50">
                {FONT_FAMILIES.map((f) => (
                  <button
                    key={f}
                    onMouseDown={noBlur(() => {
                      setStyle({ fontFamily: f });
                      setFontOpen(false);
                    })}
                    className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-secondary/60 ${
                      style.fontFamily === f ? "text-primary font-medium" : ""
                    }`}
                    style={{ fontFamily: f }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-border mx-0.5" />

          {/* Font size */}
          <button
            onMouseDown={noBlur(() => bumpSize(-1))}
            className="size-7 grid place-items-center rounded-md hover:bg-secondary/60"
            aria-label="Decrease font size"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="text-xs font-medium tabular-nums w-6 text-center">{style.fontSize}</span>
          <button
            onMouseDown={noBlur(() => bumpSize(1))}
            className="size-7 grid place-items-center rounded-md hover:bg-secondary/60"
            aria-label="Increase font size"
          >
            <Plus className="size-3.5" />
          </button>

          <div className="w-px h-5 bg-border mx-0.5" />

          {/* B / I / U */}
          <FmtToggle active={style.bold} onClick={() => setStyle({ bold: !style.bold })} label="Bold">
            <Bold className="size-3.5" />
          </FmtToggle>
          <FmtToggle active={style.italic} onClick={() => setStyle({ italic: !style.italic })} label="Italic">
            <Italic className="size-3.5" />
          </FmtToggle>
          <FmtToggle
            active={style.underline}
            onClick={() => setStyle({ underline: !style.underline })}
            label="Underline"
          >
            <Underline className="size-3.5" />
          </FmtToggle>

          <div className="w-px h-5 bg-border mx-0.5" />

          {/* Alignment */}
          <FmtToggle active={style.align === "left"} onClick={() => setAlign("left")} label="Align left">
            <AlignLeft className="size-3.5" />
          </FmtToggle>
          <FmtToggle active={style.align === "center"} onClick={() => setAlign("center")} label="Align center">
            <AlignCenter className="size-3.5" />
          </FmtToggle>
          <FmtToggle active={style.align === "right"} onClick={() => setAlign("right")} label="Align right">
            <AlignRight className="size-3.5" />
          </FmtToggle>
          <FmtToggle active={style.align === "justify"} onClick={() => setAlign("justify")} label="Justify">
            <AlignJustify className="size-3.5" />
          </FmtToggle>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FmtToggle({
  children,
  active,
  onClick,
  label,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`size-7 grid place-items-center rounded-md transition ${
        active ? "bg-primary/15 text-primary" : "text-foreground/70 hover:bg-secondary/60"
      }`}
    >
      {children}
    </button>
  );
}
