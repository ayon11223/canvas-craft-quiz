import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Shapes, Table2, BarChart3, Grid3x3, X } from "lucide-react";
import { useMcq } from "@/lib/mcq-store";

export function InsertMenu() {
  const { insertMenuOpen, setInsertMenuOpen, setShapePicker, setTableDialog, addItem } = useMcq();

  const close = () => setInsertMenuOpen(false);

  const items = [
    {
      icon: ImageIcon,
      label: "Image",
      desc: "Upload or paste a picture",
      onClick: () => {
        addItem("image", "Image");
      },
    },
    {
      icon: Shapes,
      label: "Diagram",
      desc: "Shapes, figures, geometry",
      onClick: () => {
        close();
        setShapePicker(true);
      },
    },
    {
      icon: Table2,
      label: "Table",
      desc: "Rows × columns with text",
      onClick: () => {
        close();
        setTableDialog({ mode: "table" });
      },
    },
    {
      icon: BarChart3,
      label: "Charts",
      desc: "Bars, lines, pie (coming soon)",
      onClick: () => {},
    },
    {
      icon: Grid3x3,
      label: "Matrix",
      desc: "Bracketed grid of numbers",
      onClick: () => {
        close();
        setTableDialog({ mode: "matrix" });
      },
    },
  ];

  return (
    <AnimatePresence>
      {insertMenuOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-pop pb-[env(safe-area-inset-bottom)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <div className="mx-auto mt-2 mb-1 h-1.5 w-12 rounded-full bg-muted-foreground/30" />
            <div className="flex items-center justify-between px-5 pt-2">
              <h3 className="font-display font-semibold text-base">Insert</h3>
              <button
                onClick={close}
                className="size-9 rounded-full grid place-items-center text-muted-foreground hover:text-foreground hover:bg-secondary"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="px-4 pt-3 pb-5 grid grid-cols-2 gap-2">
              {items.map((it) => (
                <button
                  key={it.label}
                  onClick={it.onClick}
                  className="flex items-center gap-3 rounded-xl bg-secondary/50 hover:bg-secondary px-3 py-3 text-left transition"
                >
                  <span className="size-10 rounded-lg bg-background grid place-items-center shrink-0">
                    <it.icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{it.label}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{it.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
