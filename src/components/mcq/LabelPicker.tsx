import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { LABEL_STYLES, useCurrentQuestion, useMcq } from "@/lib/mcq-store";

export function LabelPicker() {
  const { labelPickerOpen, setLabelPickerOpen, setLabelStyle } = useMcq();
  const q = useCurrentQuestion();

  return (
    <AnimatePresence>
      {labelPickerOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLabelPickerOpen(false)}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-pop pb-[env(safe-area-inset-bottom)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <div className="mx-auto mt-2 mb-1 h-1.5 w-12 rounded-full bg-muted-foreground/30" />
            <div className="px-5 py-4">
              <h3 className="font-display font-semibold text-base">Choice labels</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pick how options are labelled.
              </p>
              <div className="mt-4 space-y-1.5">
                {LABEL_STYLES.map((s) => {
                  const active = s.id === q.labelStyle;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setLabelStyle(s.id);
                        setLabelPickerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-4 py-3 transition ${
                        active ? "bg-primary/10 ring-1 ring-primary" : "bg-secondary/50 hover:bg-secondary"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1 font-display font-semibold text-sm">
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              className="size-7 rounded-md bg-background grid place-items-center"
                            >
                              {s.render(i)}
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">{s.name}</span>
                      </div>
                      {active && <Check className="size-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
