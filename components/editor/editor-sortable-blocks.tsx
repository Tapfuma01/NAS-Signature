"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { blockTypeLabel } from "@/lib/document-editor/block-factory";
import { cn } from "@/lib/utils";
import type { SignatureBlock } from "@/types/signature-document";
import { Copy, GripVertical, Trash2 } from "lucide-react";
import { memo } from "react";

type Props = {
  blocks: SignatureBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  disabled?: boolean;
};

const SortableRow = memo(function SortableRow({
  block,
  selected,
  onSelect,
  onRemove,
  onDuplicate,
  disabled,
}: {
  block: SignatureBlock;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group flex items-center gap-1 rounded-lg border bg-card px-1 py-1 text-sm transition-all duration-150",
        selected
          ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
          : "border-border hover:border-primary/40 hover:bg-muted/40",
        isDragging && "scale-[1.02] opacity-80 shadow-lg ring-2 ring-primary/30",
      )}
    >
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground cursor-grab touch-none p-1 active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <button
        type="button"
        className="min-w-0 flex-1 truncate px-1 py-1 text-left text-xs"
        onClick={onSelect}
      >
        {blockTypeLabel(block)}
      </button>
      <Button type="button" variant="ghost" size="icon-xs" disabled={disabled} onClick={onDuplicate}>
        <Copy className="size-3" />
      </Button>
      <Button type="button" variant="ghost" size="icon-xs" disabled={disabled} onClick={onRemove}>
        <Trash2 className="size-3 text-destructive" />
      </Button>
    </div>
  );
});

export function EditorSortableBlocks({
  blocks,
  selectedId,
  onSelect,
  onReorder,
  onRemove,
  onDuplicate,
  disabled,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = blocks.findIndex((b) => b.id === active.id);
    const to = blocks.findIndex((b) => b.id === over.id);
    if (from >= 0 && to >= 0) onReorder(from, to);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Block order</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1">
            {blocks.length === 0 ? (
              <p className="text-muted-foreground rounded-md border border-dashed px-3 py-6 text-center text-xs">
                No blocks yet — add one from the palette.
              </p>
            ) : (
              blocks.map((block) => (
                <SortableRow
                  key={block.id}
                  block={block}
                  selected={selectedId === block.id}
                  onSelect={() => onSelect(block.id)}
                  onRemove={() => onRemove(block.id)}
                  onDuplicate={() => onDuplicate(block.id)}
                  disabled={disabled}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
