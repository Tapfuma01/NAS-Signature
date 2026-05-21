"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlockStyleControls } from "@/components/editor/block-style-controls";
import type { SignatureBlock, SignatureDocument } from "@/types/signature-document";

type Props = {
  block: SignatureBlock | null;
  document: SignatureDocument;
  onUpdate: (blockId: string, patch: Partial<SignatureBlock>) => void;
  onDocumentPatch: (patch: Partial<SignatureDocument>) => void;
  disabled?: boolean;
};

export function EditorBlockInspector({
  block,
  document,
  onUpdate,
  onDocumentPatch,
  disabled,
}: Props) {
  if (!block) {
    return (
      <p className="text-muted-foreground text-sm">
        Select a block from the list to edit its properties.
      </p>
    );
  }

  const id = block.id;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Block properties</p>

      {block.type === "heading" && (
        <>
          <div className="grid gap-2">
            <Label>Level</Label>
            <Select
              value={block.level}
              onValueChange={(v) =>
                onUpdate(id, { level: v as "company" | "name" | "title" })
              }
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Text</Label>
            <Input
              value={block.text}
              onChange={(e) => onUpdate(id, { text: e.target.value })}
              disabled={disabled}
            />
          </div>
        </>
      )}

      {block.type === "logo" && (
        <>
          <div className="grid gap-2">
            <Label>Image URL</Label>
            <Input
              value={block.src}
              onChange={(e) => onUpdate(id, { src: e.target.value })}
              placeholder="https://…"
              disabled={disabled}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label>Width</Label>
              <Input
                type="number"
                value={block.width}
                onChange={(e) => onUpdate(id, { width: Number(e.target.value) || 180 })}
                disabled={disabled}
              />
            </div>
            <div className="grid gap-2">
              <Label>Height</Label>
              <Input
                type="number"
                value={block.height}
                onChange={(e) => onUpdate(id, { height: Number(e.target.value) || 48 })}
                disabled={disabled}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Align</Label>
            <Select
              value={block.align}
              onValueChange={(v) => onUpdate(id, { align: v as "left" | "center" })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {block.type === "contact_row" && (
        <>
          <div className="grid gap-2">
            <Label>Label</Label>
            <Input
              value={block.label}
              onChange={(e) => onUpdate(id, { label: e.target.value })}
              disabled={disabled}
            />
          </div>
          <div className="grid gap-2">
            <Label>Field</Label>
            <Select
              value={block.valueField}
              onValueChange={(v) =>
                onUpdate(id, {
                  valueField: v as "phone" | "email" | "whatsapp" | "custom",
                })
              }
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="custom">Custom text</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {block.valueField === "custom" && (
            <div className="grid gap-2">
              <Label>Custom value</Label>
              <Input
                value={block.customValue ?? ""}
                onChange={(e) => onUpdate(id, { customValue: e.target.value })}
                disabled={disabled}
              />
            </div>
          )}
        </>
      )}

      {block.type === "divider" && (
        <>
          <div className="grid gap-2">
            <Label>Style</Label>
            <Select
              value={block.variant ?? "line"}
              onValueChange={(v) => {
                const variant = v as "accent" | "line";
                const patch: Partial<Extract<SignatureBlock, { type: "divider" }>> = {
                  variant,
                };
                if (block.thickness == null) {
                  patch.thickness = variant === "accent" ? 3 : 1;
                }
                onUpdate(id, patch);
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accent">Accent bar</SelectItem>
                <SelectItem value="line">Line</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label>Thickness (px)</Label>
              <Input
                type="number"
                min={1}
                max={24}
                value={block.thickness ?? (block.variant === "line" ? 1 : 3)}
                onChange={(e) =>
                  onUpdate(id, {
                    thickness: Math.min(24, Math.max(1, Number(e.target.value) || 1)),
                  })
                }
                disabled={disabled}
              />
            </div>
            <div className="grid gap-2">
              <Label>Color</Label>
              <Input
                type="color"
                className="h-9 w-full cursor-pointer p-1"
                value={block.color ?? "#b8860b"}
                onChange={(e) => onUpdate(id, { color: e.target.value })}
                disabled={disabled}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Width</Label>
            <Select
              value={
                typeof block.width === "number"
                  ? "custom"
                  : (block.width ?? "template")
              }
              onValueChange={(v) => {
                if (v === "template") {
                  onUpdate(id, { width: undefined });
                } else if (v === "full") {
                  onUpdate(id, { width: "full" });
                } else if (v === "short") {
                  onUpdate(id, { width: "short" });
                } else {
                  onUpdate(id, { width: 80 });
                }
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="template">Template default</SelectItem>
                <SelectItem value="full">Full width</SelectItem>
                <SelectItem value="short">Short (80px)</SelectItem>
                <SelectItem value="custom">Custom (px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {typeof block.width === "number" ? (
            <div className="grid gap-2">
              <Label>Custom width (px)</Label>
              <Input
                type="number"
                min={20}
                max={600}
                value={block.width}
                onChange={(e) =>
                  onUpdate(id, {
                    width: Math.min(600, Math.max(20, Number(e.target.value) || 80)),
                  })
                }
                disabled={disabled}
              />
            </div>
          ) : null}
        </>
      )}

      {block.type === "footer_link" && (
        <>
          <div className="grid gap-2">
            <Label>Label</Label>
            <Input
              value={block.label}
              onChange={(e) => onUpdate(id, { label: e.target.value })}
              disabled={disabled}
            />
          </div>
          <div className="grid gap-2">
            <Label>URL</Label>
            <Input
              value={block.url}
              onChange={(e) => onUpdate(id, { url: e.target.value })}
              disabled={disabled}
            />
          </div>
        </>
      )}

      {block.type === "spacer" && (
        <div className="grid gap-2">
          <Label>Height (px)</Label>
          <Input
            type="number"
            min={0}
            max={48}
            value={block.height}
            onChange={(e) => onUpdate(id, { height: Number(e.target.value) || 0 })}
            disabled={disabled}
          />
        </div>
      )}

      {block.type === "banner" && (
        <>
          <div className="grid gap-2">
            <Label>Image URL</Label>
            <Input
              value={block.src}
              onChange={(e) => onUpdate(id, { src: e.target.value })}
              disabled={disabled}
            />
          </div>
          <div className="grid gap-2">
            <Label>Link URL (optional)</Label>
            <Input
              value={block.href ?? ""}
              onChange={(e) => onUpdate(id, { href: e.target.value })}
              disabled={disabled}
            />
          </div>
        </>
      )}

      {block.type === "disclaimer" && (
        <div className="grid gap-2">
          <Label>Text</Label>
          <textarea
            className="border-input bg-background min-h-24 w-full rounded-lg border px-2.5 py-2 text-sm"
            value={block.text}
            onChange={(e) => onUpdate(id, { text: e.target.value })}
            disabled={disabled}
          />
        </div>
      )}

      {block.type === "social" && (
        <div className="flex flex-col gap-3">
          {block.items.map((item, index) => (
            <div key={index} className="rounded-md border border-border p-2">
              <div className="grid gap-2">
                <Label>Network</Label>
                <Input
                  value={item.network}
                  onChange={(e) => {
                    const items = [...block.items];
                    items[index] = { ...items[index]!, network: e.target.value };
                    onUpdate(id, { items });
                  }}
                  disabled={disabled}
                />
              </div>
              <div className="mt-2 grid gap-2">
                <Label>URL</Label>
                <Input
                  value={item.url}
                  onChange={(e) => {
                    const items = [...block.items];
                    items[index] = { ...items[index]!, url: e.target.value };
                    onUpdate(id, { items });
                  }}
                  disabled={disabled}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            className="text-primary text-xs hover:underline disabled:opacity-50"
            disabled={disabled}
            onClick={() =>
              onUpdate(id, {
                items: [...block.items, { network: "Link", url: "" }],
              })
            }
          >
            + Add link
          </button>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <BlockStyleControls
          block={block}
          onUpdate={(patch) => onUpdate(id, patch)}
          disabled={disabled}
        />
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wide">Canvas</p>
        <div className="grid gap-2">
          <Label>Width</Label>
          <Select
            value={String(document.canvasWidth)}
            onValueChange={(v) =>
              onDocumentPatch({ canvasWidth: Number(v) as 500 | 600 })
            }
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="500">500px</SelectItem>
              <SelectItem value="600">600px</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
