import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMcq } from "@/lib/mcq-store";
import { motion } from "framer-motion";

export function SlideStrip() {
  const { questions, currentId, setCurrent, addQuestion } = useMcq();
  const idx = questions.findIndex((q) => q.id === currentId);

  const go = (d: number) => {
    const next = idx + d;
    if (next >= 0 && next < questions.length) setCurrent(questions[next].id);
  };

  return (
    <div className="px-2 pt-3 pb-3 bg-background">
      <div className="flex items-center gap-2">
        <button
          onClick={() => go(-1)}
          disabled={idx === 0}
          className="size-9 rounded-lg bg-card grid place-items-center disabled:opacity-30 border border-border"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div className="flex-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-center gap-3 px-1 min-w-min mx-auto w-fit">
            {questions.map((q, i) => {
              const active = q.id === currentId;
              return (
                <motion.button
                  key={q.id}
                  layout
                  onClick={() => setCurrent(q.id)}
                  className={`relative shrink-0 rounded-lg w-16 h-12 text-[10px] font-medium text-canvas-foreground/70 transition ${
                    active
                      ? "ring-2 ring-primary shadow-pop"
                      : "ring-1 ring-border"
                  }`}
                  style={{ backgroundColor: "var(--color-canvas)" }}
                >
                  <span className="absolute bottom-1 left-1.5">{i + 1}</span>
                  {q.text && (
                    <span className="absolute top-1 left-1.5 right-1.5 text-left truncate text-canvas-foreground/50">
                      {q.text.slice(0, 8)}
                    </span>
                  )}
                </motion.button>
              );
            })}
            <button
              onClick={addQuestion}
              className="shrink-0 size-12 rounded-lg border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/50 grid place-items-center"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <button
          onClick={() => go(1)}
          disabled={idx === questions.length - 1}
          className="size-9 rounded-lg bg-card grid place-items-center disabled:opacity-30 border border-border"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
