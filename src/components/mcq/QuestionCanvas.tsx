import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronsUpDown, X, Plus, Trash2 } from "lucide-react";
import { useCurrentQuestion, useMcq, type CanvasItem } from "@/lib/mcq-store";
import { Shape } from "./Shape";

const HEIGHTS = { closed: 120, half: 280, full: 460 } as const;

export function QuestionCanvas() {
  const q = useCurrentQuestion();
  const { updateCurrent, cycleCanvasSize, shrinkCanvas, setShapePicker } = useMcq();
  const open = q.canvasSize !== "closed";

  return (
    <div className="px-4 pt-4">
      <motion.div
        layout
        className="canvas-paper rounded-2xl p-4 text-canvas-foreground shadow-soft relative overflow-hidden"
        animate={{ height: HEIGHTS[q.canvasSize] }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        <div className="flex items-start gap-2 h-full">
          <span className="font-display font-semibold text-lg leading-none mt-1">
            {numberOf(q.id)}.
          </span>
          {open ? (
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

        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <button
            onClick={cycleCanvasSize}
            className="flex items-center gap-1 text-[11px] text-canvas-foreground/70 hover:text-canvas-foreground px-2 py-0.5 rounded-full hover:bg-canvas-foreground/5"
          >
            {q.canvasSize === "closed" ? (
              <>Add Figures / Image <ChevronDown className="size-3" /></>
            ) : q.canvasSize === "half" ? (
              <>Expand more <ChevronsUpDown className="size-3" /></>
            ) : (
              <>Fully expanded</>
            )}
          </button>
          {open && (
            <button
              onClick={shrinkCanvas}
              className="flex items-center gap-1 text-[11px] text-canvas-foreground/70 hover:text-canvas-foreground px-2 py-0.5 rounded-full hover:bg-canvas-foreground/5"
              aria-label="Close canvas"
            >
              Close <X className="size-3" />
            </button>
          )}
        </div>

        {open && (
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
  const [editing, setEditing] = useState(false);
  const draggedRef = useRef(false);

  const startDrag = (e: ReactPointerEvent, mode: "move" | "resize") => {
    e.stopPropagation();
    e.preventDefault();
    selectItem(item.id);
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const start = { x: item.x, y: item.y, w: item.w, h: item.h };
    draggedRef.current = false;

    const onMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) / rect.width;
      const dy = (ev.clientY - startY) / rect.height;
      if (Math.abs(dx) + Math.abs(dy) > 0.005) draggedRef.current = true;
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
        if (isText && editing) return;
        startDrag(e, "move");
      }}
      onDoubleClick={() => {
        if (isText) setEditing(true);
      }}
    >
      <div
        className={`relative w-full h-full rounded-md ${
          selected ? "ring-2 ring-primary ring-offset-1 ring-offset-canvas" : ""
        } ${isText && !editing ? "cursor-move" : ""}`}
      >
        {isText ? (
          editing ? (
            <input
              autoFocus
              value={item.label ?? ""}
              onChange={(e) => updateItem(item.id, { label: e.target.value })}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") setEditing(false);
              }}
              placeholder="Text"
              className="w-full h-full bg-transparent border-0 outline-none text-canvas-foreground text-[14px] leading-tight px-1"
              style={{ touchAction: "auto" }}
            />
          ) : (
            <div className="w-full h-full px-1 text-[14px] leading-tight text-canvas-foreground flex items-center overflow-hidden whitespace-pre-wrap break-words">
              {item.label?.trim() ? item.label : <span className="text-canvas-foreground/40">Double-tap to edit</span>}
            </div>
          )
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
