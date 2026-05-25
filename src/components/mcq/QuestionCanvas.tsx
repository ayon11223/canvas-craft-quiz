import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Plus, Trash2, Move } from "lucide-react";
import { useCurrentQuestion, useMcq, type CanvasItem } from "@/lib/mcq-store";
import { Shape } from "./Shape";

export function QuestionCanvas() {
  const q = useCurrentQuestion();
  const { updateCurrent, toggleFigure, setShapePicker } = useMcq();

  return (
    <div className="px-4 pt-4">
      <motion.div
        layout
        className="canvas-paper rounded-2xl p-4 text-canvas-foreground shadow-soft relative overflow-hidden"
        animate={{ height: q.figureOpen ? 420 : 120 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        <div className="flex items-start gap-2 h-full">
          <span className="font-display font-semibold text-lg leading-none mt-1">
            {numberOf(q.id)}.
          </span>
          {q.figureOpen ? (
            <FigureArea />
          ) : (
            <textarea
              value={q.text}
              onChange={(e) => updateCurrent({ text: e.target.value })}
              placeholder="Type your question..."
              className="flex-1 h-full bg-transparent resize-none outline-none text-[15px] leading-snug placeholder:text-canvas-foreground/40"
            />
          )}
        </div>

        <button
          onClick={toggleFigure}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[11px] text-canvas-foreground/70 hover:text-canvas-foreground"
        >
          {q.figureOpen ? (
            <>Close <ChevronUp className="size-3" /></>
          ) : (
            <>Add Figures / Image <ChevronDown className="size-3" /></>
          )}
        </button>

        {q.figureOpen && (
          <button
            onClick={() => setShapePicker(true)}
            className="absolute top-2 right-2 size-8 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-pop"
            aria-label="Add shape"
          >
            <Plus className="size-4" />
          </button>
        )}
      </motion.div>
    </div>
  );
}

function numberOf(id: string) {
  const idx = useMcq.getState().questions.findIndex((x) => x.id === id);
  return idx + 1;
}

function FigureArea() {
  const q = useCurrentQuestion();
  const { selectedItemId, selectItem } = useMcq();
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="flex-1 h-full relative"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) selectItem(null);
      }}
    >
      {q.text && (
        <div className="absolute top-0 left-0 right-0 text-[13px] text-canvas-foreground/80 pointer-events-none">
          {q.text}
        </div>
      )}
      <AnimatePresence>
        {q.items.map((it) => (
          <DraggableItem
            key={it.id}
            item={it}
            containerRef={ref}
            selected={selectedItemId === it.id}
          />
        ))}
      </AnimatePresence>
      {q.items.length === 0 && (
        <div className="absolute inset-0 grid place-items-center text-canvas-foreground/40 text-xs text-center px-6 pointer-events-none">
          Tap + to add shapes, equations or import figures
        </div>
      )}
    </div>
  );
}

function DraggableItem({
  item,
  containerRef,
  selected,
}: {
  item: CanvasItem;
  containerRef: React.RefObject<HTMLDivElement | null>;
  selected: boolean;
}) {
  const { updateItem, selectItem, removeItem } = useMcq();
  const isText = item.kind === "text";

  const startDrag = (e: ReactPointerEvent, mode: "move" | "resize") => {
    e.stopPropagation();
    e.preventDefault();
    selectItem(item.id);
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const start = { x: item.x, y: item.y, w: item.w, h: item.h };

    const onMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) / rect.width;
      const dy = (ev.clientY - startY) / rect.height;
      if (mode === "move") {
        updateItem(item.id, {
          x: clamp(start.x + dx, 0, Math.max(0, 1 - start.w)),
          y: clamp(start.y + dy, 0, Math.max(0, 1 - start.h)),
        });
      } else {
        updateItem(item.id, {
          w: clamp(start.w + dx, 0.08, 1 - start.x),
          h: clamp(start.h + dy, 0.06, 1 - start.y),
        });
      }
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.6, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="absolute select-none"
      style={{
        left: `${item.x * 100}%`,
        top: `${item.y * 100}%`,
        width: `${item.w * 100}%`,
        height: `${item.h * 100}%`,
        touchAction: "none",
      }}
      onPointerDown={(e) => {
        // Text items: only the move handle drags. Body is editable.
        if (isText) {
          selectItem(item.id);
          return;
        }
        startDrag(e, "move");
      }}
    >
      <div
        className={`relative w-full h-full rounded-md ${
          selected ? "ring-2 ring-primary" : ""
        }`}
      >
        {isText ? (
          <input
            value={item.label ?? ""}
            onChange={(e) => updateItem(item.id, { label: e.target.value })}
            onFocus={() => selectItem(item.id)}
            placeholder="Text"
            className="w-full h-full bg-transparent border-0 outline-none text-canvas-foreground text-[14px] leading-tight px-1"
            style={{ touchAction: "auto" }}
          />
        ) : (
          <Shape
            kind={item.kind}
            label={item.label}
            className="w-full h-full pointer-events-none"
          />
        )}
        {selected && (
          <>
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                removeItem(item.id);
              }}
              className="absolute -top-3 -left-3 size-6 rounded-full bg-destructive text-destructive-foreground grid place-items-center shadow-pop"
            >
              <Trash2 className="size-3" />
            </button>
            {isText && (
              <button
                onPointerDown={(e) => startDrag(e, "move")}
                className="absolute -top-3 left-5 size-6 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-pop cursor-move"
                aria-label="Move"
              >
                <Move className="size-3" />
              </button>
            )}
            <div
              onPointerDown={(e) => startDrag(e, "resize")}
              className="absolute -bottom-2 -right-2 size-5 rounded-full bg-primary border-2 border-canvas cursor-se-resize"
              style={{ touchAction: "none" }}
            />
          </>
        )}
      </div>
    </motion.div>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
