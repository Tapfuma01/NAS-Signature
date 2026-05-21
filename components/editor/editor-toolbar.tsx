"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ExternalLink, Redo2, Save, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  slug: string;
  publicUrl: string;
  canUndo: boolean;
  canRedo: boolean;
  pending: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
};

export function EditorToolbar({
  name,
  slug,
  publicUrl,
  canUndo,
  canRedo,
  pending,
  onUndo,
  onRedo,
  onSave,
}: Props) {
  return (
    <div className="bg-card flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Design</Badge>
          <code className="text-muted-foreground text-xs">/{slug}</code>
        </div>
        <h1 className="font-heading mt-1 truncate text-lg font-semibold tracking-tight">{name}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ExternalLink className="size-4" />
          Public page
        </Link>
        <Button type="button" variant="outline" size="sm" disabled={!canUndo || pending} onClick={onUndo}>
          <Undo2 className="size-4" />
          Undo
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={!canRedo || pending} onClick={onRedo}>
          <Redo2 className="size-4" />
          Redo
        </Button>
        <Button type="button" size="sm" disabled={pending} onClick={onSave}>
          <Save className="size-4" />
          Save
        </Button>
      </div>
    </div>
  );
}
