import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { TopBar } from "@/components/mcq/TopBar";
import { QuestionCanvas } from "@/components/mcq/QuestionCanvas";
import { OptionsList } from "@/components/mcq/OptionsList";
import { SolutionPanel } from "@/components/mcq/SolutionPanel";
import { SlideStrip } from "@/components/mcq/SlideStrip";
import { BottomToolbar } from "@/components/mcq/BottomToolbar";
import { ShapePicker } from "@/components/mcq/ShapePicker";
import { LabelPicker } from "@/components/mcq/LabelPicker";
import { OptionsSettings } from "@/components/mcq/OptionsSettings";
import { InsertMenu } from "@/components/mcq/InsertMenu";
import { TableDialog } from "@/components/mcq/TableDialog";
import { useMcq } from "@/lib/mcq-store";

export const Route = createFileRoute("/")({
  component: Editor,
});

function Editor() {
  const { questions, currentId, setCurrent } = useMcq();
  const start = useRef<{ x: number; y: number; t: number; blocked: boolean } | null>(null);

  const isBlocked = (target: EventTarget | null) => {
    const el = target as HTMLElement | null;
    if (!el) return false;
    // Block when starting inside actual text input, canvas-item drag, or explicit no-swipe regions.
    return !!el.closest(
      "input, textarea, select, [contenteditable='true'], [data-canvas-item], [data-no-swipe]",
    );
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    start.current = {
      x: t.clientX,
      y: t.clientY,
      t: Date.now(),
      blocked: isBlocked(e.target),
    };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const s = start.current;
    if (!s || s.blocked) return;
    // Cancel if becomes clearly vertical (let scroll happen).
    const t = e.touches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dy) > 40 && Math.abs(dy) > Math.abs(dx) * 1.4) {
      start.current = null;
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const s = start.current;
    start.current = null;
    if (!s || s.blocked) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    const dt = Date.now() - s.t;
    if (Math.abs(dx) < 50) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.2) return;
    if (dt > 700) return;
    const idx = questions.findIndex((q) => q.id === currentId);
    const next = dx < 0 ? idx + 1 : idx - 1;
    if (next >= 0 && next < questions.length) setCurrent(questions[next].id);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />
      <main
        className="flex-1 overflow-y-auto pb-2"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <QuestionCanvas />
        <OptionsList />
        <SolutionPanel />
      </main>
      <SlideStrip />
      <BottomToolbar />
      <ShapePicker />
      <LabelPicker />
      <OptionsSettings />
      <InsertMenu />
      <TableDialog />
    </div>
  );
}
