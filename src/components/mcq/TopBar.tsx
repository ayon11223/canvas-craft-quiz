import { Menu, Undo2, Redo2, Download, Bell, LayoutGrid, Search } from "lucide-react";
import { useMcq } from "@/lib/mcq-store";
import { undo, redo, useCanUndo, useCanRedo } from "@/lib/history";

export function TopBar() {
  const setGridViewOpen = useMcq((s) => s.setGridViewOpen);
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  return (
    <div className="bg-toolbar border-b border-black/40 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button className="text-foreground/80 hover:text-foreground"><Menu className="size-5" /></button>
          <button
            onClick={undo}
            disabled={!canUndo}
            aria-label="Undo"
            className="text-foreground/80 hover:text-foreground disabled:opacity-40 disabled:hover:text-foreground/80"
          >
            <Undo2 className="size-5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            aria-label="Redo"
            className="text-foreground/80 hover:text-foreground disabled:opacity-40 disabled:hover:text-foreground/80"
          >
            <Redo2 className="size-5" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-foreground/80 hover:text-foreground"><Download className="size-5" /></button>
          <button className="text-foreground/80 hover:text-foreground"><Bell className="size-5" /></button>
          <button
            onClick={() => setGridViewOpen(true)}
            className="text-foreground/80 hover:text-foreground"
            aria-label="Slides grid view"
          >
            <LayoutGrid className="size-5" />
          </button>
          <button className="text-foreground/80 hover:text-foreground"><Search className="size-5" /></button>
        </div>
      </div>
    </div>
  );
}
