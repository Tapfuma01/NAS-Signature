"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlockStyle } from "@/types/block-style";
import type { SignatureBlock } from "@/types/signature-document";

type Props = {
  block: SignatureBlock;
  onUpdate: (patch: Partial<SignatureBlock>) => void;
  disabled?: boolean;
  showColors?: boolean;
};

function SpacingInput({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number | undefined;
  onChange: (n: number | undefined) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-1">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <Input
        type="number"
        min={0}
        max={64}
        step={1}
        className="h-8 text-xs"
        value={value ?? ""}
        placeholder="0"
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? undefined : Math.max(0, Number(v)));
        }}
        disabled={disabled}
      />
    </div>
  );
}

export function BlockStyleControls({ block, onUpdate, disabled, showColors = true }: Props) {
  const style = block.style ?? {};

  function patchStyle(patch: Partial<BlockStyle>) {
    const next = { ...style, ...patch };
    const cleaned = Object.fromEntries(
      Object.entries(next).filter(([, v]) => v !== undefined && v !== ""),
    ) as BlockStyle;
    onUpdate({
      style: Object.keys(cleaned).length > 0 ? cleaned : undefined,
    } as Partial<SignatureBlock>);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-muted-foreground mb-2 text-[10px] font-medium uppercase tracking-wide">
          Spacing
        </p>
        <div className="grid grid-cols-2 gap-2">
          <SpacingInput
            label="Pad top"
            value={style.paddingTop}
            onChange={(n) => patchStyle({ paddingTop: n })}
            disabled={disabled}
          />
          <SpacingInput
            label="Pad bottom"
            value={style.paddingBottom}
            onChange={(n) => patchStyle({ paddingBottom: n })}
            disabled={disabled}
          />
          <SpacingInput
            label="Pad left"
            value={style.paddingLeft}
            onChange={(n) => patchStyle({ paddingLeft: n })}
            disabled={disabled}
          />
          <SpacingInput
            label="Pad right"
            value={style.paddingRight}
            onChange={(n) => patchStyle({ paddingRight: n })}
            disabled={disabled}
          />
          <SpacingInput
            label="Margin top"
            value={style.marginTop}
            onChange={(n) => patchStyle({ marginTop: n })}
            disabled={disabled}
          />
          <SpacingInput
            label="Margin bottom"
            value={style.marginBottom}
            onChange={(n) => patchStyle({ marginBottom: n })}
            disabled={disabled}
          />
          <SpacingInput
            label="Margin left"
            value={style.marginLeft}
            onChange={(n) => patchStyle({ marginLeft: n })}
            disabled={disabled}
          />
          <SpacingInput
            label="Margin right"
            value={style.marginRight}
            onChange={(n) => patchStyle({ marginRight: n })}
            disabled={disabled}
          />
        </div>
      </div>

      {showColors && (
        <div>
          <p className="text-muted-foreground mb-2 text-[10px] font-medium uppercase tracking-wide">
            Colors
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label className="text-[10px] text-muted-foreground">Text / fill</Label>
              <Input
                type="color"
                className="h-9 w-full cursor-pointer p-1"
                value={style.color ?? "#000000"}
                onChange={(e) => patchStyle({ color: e.target.value })}
                disabled={disabled}
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-[10px] text-muted-foreground">Background</Label>
              <Input
                type="color"
                className="h-9 w-full cursor-pointer p-1"
                value={style.backgroundColor ?? "#ffffff"}
                onChange={(e) => patchStyle({ backgroundColor: e.target.value })}
                disabled={disabled}
              />
            </div>
            <div className="col-span-2 grid gap-1">
              <Label className="text-[10px] text-muted-foreground">Border / line</Label>
              <Input
                type="color"
                className="h-9 w-full cursor-pointer p-1"
                value={style.borderColor ?? "#cccccc"}
                onChange={(e) => patchStyle({ borderColor: e.target.value })}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
