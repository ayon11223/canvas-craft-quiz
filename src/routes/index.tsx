import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/mcq/TopBar";
import { QuestionCanvas } from "@/components/mcq/QuestionCanvas";
import { OptionsList } from "@/components/mcq/OptionsList";
import { SolutionPanel } from "@/components/mcq/SolutionPanel";
import { SlideStrip } from "@/components/mcq/SlideStrip";
import { BottomToolbar } from "@/components/mcq/BottomToolbar";
import { ShapePicker } from "@/components/mcq/ShapePicker";
import { LabelPicker } from "@/components/mcq/LabelPicker";
import { OptionsSettings } from "@/components/mcq/OptionsSettings";

export const Route = createFileRoute("/")({
  component: Editor,
});

function Editor() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />
      <main className="flex-1 overflow-y-auto pb-2">
        <QuestionCanvas />
        <OptionsList />
        <SolutionPanel />
      </main>
      <SlideStrip />
      <BottomToolbar />
      <ShapePicker />
      <LabelPicker />
    </div>
  );
}
