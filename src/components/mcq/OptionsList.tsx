import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreVertical, Check } from "lucide-react";
import { LABEL_STYLES, useCurrentQuestion, useMcq, type Option } from "@/lib/mcq-store";
import { useLongPress } from "@/hooks/use-long-press";

export function OptionsList() {
  const q = useCurrentQuestion();
  const { reorderOptions, setLabelPickerOpen } = useMcq();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const renderLabel = LABEL_STYLES.find((s) => s.id === q.labelStyle)!.render;

  const longPress = useLongPress(() => setLabelPickerOpen(true));

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const ids = q.options.map((o) => o.id);
    const next = arrayMove(ids, ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id)));
    reorderOptions(next);
  };

  return (
    <div className="px-4 mt-4">
      <div className="rounded-2xl bg-card p-3 shadow-soft border border-border">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={q.options.map((o) => o.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {q.options.map((o, i) => (
                <SortableOption
                  key={o.id}
                  option={o}
                  label={renderLabel(i)}
                  labelHandlers={longPress}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

function SortableOption({
  option,
  label,
  labelHandlers,
}: {
  option: Option;
  label: string;
  labelHandlers: ReturnType<typeof useLongPress>;
}) {
  const { setOption, removeOption } = useMcq();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: option.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
      }}
      className={`group flex items-center gap-2 rounded-xl bg-secondary/60 pl-1 pr-2 ${
        isDragging ? "shadow-pop ring-1 ring-primary/40" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-2 text-muted-foreground hover:text-foreground cursor-grab touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>
      <button
        {...labelHandlers}
        onClick={() => setOption(option.id, { correct: !option.correct })}
        className={`relative font-display font-semibold text-sm size-8 rounded-lg grid place-items-center shrink-0 transition ${
          option.correct
            ? "bg-primary text-primary-foreground"
            : "bg-background text-foreground"
        }`}
      >
        {option.correct ? <Check className="size-4" /> : label}
      </button>
      <input
        value={option.text}
        onChange={(e) => setOption(option.id, { text: e.target.value })}
        placeholder={`Option ${label}`}
        className="flex-1 bg-transparent text-sm py-3 outline-none placeholder:text-muted-foreground/60"
      />
      <button
        onClick={() => removeOption(option.id)}
        className="p-2 text-muted-foreground/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition"
        aria-label="Remove option"
      >
        <MoreVertical className="size-4" />
      </button>
    </div>
  );
}
