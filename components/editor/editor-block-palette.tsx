"use client";

import { Button } from "@/components/ui/button";
import { createBlock, PALETTE_BLOCKS, type PaletteBlockType } from "@/lib/document-editor/block-factory";
import type { SignatureBlock } from "@/types/signature-document";
import { Plus } from "lucide-react";

type Props = {
  onAdd: (block: SignatureBlock) => void;
  disabled?: boolean;
};

export function EditorBlockPalette({ onAdd, disabled }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Add block</p>
      <div className="grid gap-1.5">
        {PALETTE_BLOCKS.map((item) => (
          <Button
            key={item.type}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className="h-auto justify-start px-2.5 py-2 text-left"
            onClick={() => onAdd(createBlock(item.type as PaletteBlockType))}
          >
            <Plus className="size-3.5 shrink-0 opacity-60" />
            <span className="flex min-w-0 flex-col items-start gap-0.5">
              <span className="text-xs font-medium">{item.label}</span>
              <span className="text-muted-foreground text-[10px] leading-tight font-normal">
                {item.description}
              </span>
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
