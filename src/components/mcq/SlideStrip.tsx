import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMcq, LABEL_STYLES, type Question } from "@/lib/mcq-store";
import { Shape } from "./Shape";
import { motion } from "framer-motion";

export function SlideStrip() {
  const { questions, currentId, setCurrent, addQuestion } = useMcq();
  const idx = questions.findIndex((q) => q.id === currentId);

  const go = (d: number) => {
    const next = idx + d;
    if (next >= 0 && next < questions.length) setCurrent(questions[next].id);
  };

  return (
    <div className="px-2 pt-2 pb-2 bg-background border-t border-border/60">
      <div className="flex items-center gap-2">
        <button
          onClick={() => go(-1)}
          disabled={idx === 0}
          className="size-8 rounded-md bg-card grid place-items-center disabled:opacity-30 border border-border shrink-0"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div className="flex-1 overflow-x-auto no-scrollbar">
          <div className="flex items-stretch gap-2 px-1 w-fit mx-auto">
            {questions.map((q, i) => (
              <SlideThumb
                key={q.id}
                q={q}
                index={i}
                active={q.id === currentId}
                onClick={() => setCurrent(q.id)}
              />
            ))}
            <button
              onClick={addQuestion}
              className="shrink-0 w-[88px] h-[60px] rounded-md border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/50 grid place-items-center self-center"
              aria-label="Add slide"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <button
          onClick={() => go(1)}
          disabled={idx === questions.length - 1}
          className="size-8 rounded-md bg-card grid place-items-center disabled:opacity-30 border border-border shrink-0"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

function SlideThumb({
  q,
  index,
  active,
  onClick,
}: {
  q: Question;
  index: number;
  active: boolean;
  onClick: () => void;
}) {
  const renderLabel = LABEL_STYLES.find((s) => s.id === q.labelStyle)!.render;
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span
        className={`text-[10px] font-medium tabular-nums ${
          active ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {index + 1}
      </span>
      <motion.button
        layout
        onClick={onClick}
        className={`relative w-[88px] h-[60px] rounded-md overflow-hidden text-left transition ${
          active
            ? "ring-2 ring-primary shadow-pop"
            : "ring-1 ring-border hover:ring-foreground/30"
        }`}
        style={{ backgroundColor: "var(--color-canvas)" }}
      >
        <div className="absolute inset-0 p-1.5 flex flex-col gap-0.5">
          <div className="text-canvas-foreground text-[6px] leading-[1.15] font-medium line-clamp-2 min-h-[12px]">
            {q.text || (
              <span className="text-canvas-foreground/40">Untitled</span>
            )}
          </div>
          {q.items.length > 0 && (
            <div className="relative flex-1 min-h-[14px] rounded-[2px] bg-canvas-foreground/5 overflow-hidden">
              {q.items.map((it) => (
                <div
                  key={it.id}
                  className="absolute"
                  style={{
                    left: `${it.x * 100}%`,
                    top: `${it.y * 100}%`,
                    width: `${it.w * 100}%`,
                    height: `${it.h * 100}%`,
                  }}
                >
                  {it.kind === "text" ? (
                    <div className="w-full h-full text-canvas-foreground/80 text-[4px] leading-none truncate">
                      {it.label || "T"}
                    </div>
                  ) : (
                    <Shape kind={it.kind} className="w-full h-full" />
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex-1 flex flex-col gap-[1px] justify-end">
            {q.options.slice(0, 4).map((o, i) => (
              <div key={o.id} className="flex items-center gap-0.5">
                <span
                  className={`text-[5px] font-semibold leading-none w-[7px] h-[7px] grid place-items-center rounded-[2px] ${
                    o.correct
                      ? "bg-primary text-primary-foreground"
                      : "bg-canvas-foreground/10 text-canvas-foreground/70"
                  }`}
                >
                  {renderLabel(i)}
                </span>
                <span className="text-canvas-foreground/70 text-[5px] leading-none truncate flex-1">
                  {o.text || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.button>
    </div>
  );
}
