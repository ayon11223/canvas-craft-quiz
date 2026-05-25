import { FolderOpen, Camera, Plus, Type, Sparkles } from "lucide-react";
import { useMcq } from "@/lib/mcq-store";

export function BottomToolbar() {
  const { setShapePicker, setSolutionOpen, solutionOpen, addItem } = useMcq();

  const items = [
    { icon: FolderOpen, label: "Library", onClick: () => {} },
    { icon: Camera, label: "Scan", onClick: () => {} },
    { icon: Plus, label: "Add", primary: true, onClick: () => setShapePicker(true) },
    { icon: Type, label: "Text", onClick: () => addItem("text", "") },
    { icon: Sparkles, label: "AI", onClick: () => setSolutionOpen(!solutionOpen) },
  ];

  return (
    <div className="bg-toolbar border-t border-black/40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-4 py-3">
        {items.map((it) =>
          it.primary ? (
            <button
              key={it.label}
              onClick={it.onClick}
              className="size-14 -mt-6 rounded-full bg-foreground text-background grid place-items-center shadow-pop ring-4 ring-toolbar"
              aria-label={it.label}
            >
              <it.icon className="size-6" />
            </button>
          ) : (
            <button
              key={it.label}
              onClick={it.onClick}
              className="size-11 grid place-items-center text-foreground/70 hover:text-foreground"
              aria-label={it.label}
            >
              <it.icon className="size-6" strokeWidth={1.5} />
            </button>
          ),
        )}
      </div>
    </div>
  );
}
