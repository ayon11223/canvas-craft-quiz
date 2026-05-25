import { Menu, Undo2, Redo2, Download, Bell, Share2, Search } from "lucide-react";

export function TopBar() {
  return (
    <div className="bg-toolbar border-b border-black/40 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button className="text-foreground/80 hover:text-foreground"><Menu className="size-5" /></button>
          <button className="text-foreground/80 hover:text-foreground"><Undo2 className="size-5" /></button>
          <button className="text-foreground/80 hover:text-foreground"><Redo2 className="size-5" /></button>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-foreground/80 hover:text-foreground"><Download className="size-5" /></button>
          <button className="text-foreground/80 hover:text-foreground"><Bell className="size-5" /></button>
          <button className="text-foreground/80 hover:text-foreground"><Share2 className="size-5" /></button>
          <button className="text-foreground/80 hover:text-foreground"><Search className="size-5" /></button>
        </div>
      </div>
    </div>
  );
}
