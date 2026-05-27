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
import { useMcq } from "@/lib/mcq-store";

export const Route = createFileRoute("/")({
  component: Editor,
});

function Editor() {
  const { questions, currentId, setCurrent } = useMcq();
  const start = useRef<{ x: number; y: number; t: number; blocked: boolean } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    // Skip swipe nav if the gesture starts on interactive canvas/input/option content
    const el = e.target as HTMLElement;
    const blocked = !!el.closest(
      "input, textarea, [data-no-swipe], [data-canvas-item], button"
    );
    start.current = { x: t.clientX, y: t.clientY, t: Date.now(), blocked };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const s = start.current;
    start.current = null;
    if (!s || s.blocked) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx)) return;
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
    </div>
  );
}
