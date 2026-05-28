import { FolderOpen, ScanLine, Plus, FunctionSquare, Type, Sparkles } from "lucide-react";
import { useMcq } from "@/lib/mcq-store";

export function BottomToolbar() {
  const { setInsertMenuOpen, setSolutionOpen, solutionOpen, addItem } = useMcq();

  const items = [
    { icon: FolderOpen, label: "Library", onClick: () => {} },
    { icon: ScanLine, label: "Scanner", onClick: () => {} },
    { icon: Plus, label: "Insert", primary: true, onClick: () => setInsertMenuOpen(true) },
    { icon: FunctionSquare, label: "Equations", onClick: () => addItem("equation", "∫f(x)dx") },
    { icon: Type, label: "Text Box", onClick: () => addItem("text", "") },
    { icon: Sparkles, label: "AI", onClick: () => setSolutionOpen(!solutionOpen) },
  ];

  return (
    <div className="bg-toolbar border-t border-black/40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-end justify-around px-2 py-2">
        {items.map((it) =>
          it.primary ? (
            <button
              key={it.label}
              onClick={it.onClick}
              className="flex flex-col items-center gap-1"
              aria-label={it.label}
            >
              <span className="size-12 -mt-5 rounded-full bg-foreground text-background grid place-items-center shadow-pop ring-4 ring-toolbar">
                <it.icon className="size-5" />
              </span>
              <span className="text-[9px] font-medium uppercase tracking-wider text-foreground/60">
                {it.label}
              </span>
            </button>
          ) : (
            <button
              key={it.label}
              onClick={it.onClick}
              className="flex flex-col items-center gap-1 text-foreground/70 hover:text-foreground py-1 px-1"
              aria-label={it.label}
            >
              <it.icon className="size-5" strokeWidth={1.5} />
              <span className="text-[9px] font-medium uppercase tracking-wider">{it.label}</span>
            </button>
          ),
        )}
      </div>
    </div>
  );
}
