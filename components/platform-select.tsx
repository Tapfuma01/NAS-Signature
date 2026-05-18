"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLATFORM_META } from "@/lib/platform-install";
import { TARGET_PLATFORMS, type TargetPlatform } from "@/types/signature-document";

export { PLATFORM_META, getPlatformMeta, copyButtonLabel } from "@/lib/platform-install";

type Props = {
  value: TargetPlatform;
  onChange: (value: TargetPlatform) => void;
  disabled?: boolean;
  id?: string;
};

export function PlatformSelect({ value, onChange, disabled, id = "target-platform" }: Props) {
  const selected = PLATFORM_META[value];
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>Email platform</Label>
      <Select value={value} onValueChange={(v) => onChange(v as TargetPlatform)} disabled={disabled}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Select platform" />
        </SelectTrigger>
        <SelectContent>
          {TARGET_PLATFORMS.map((platform) => (
            <SelectItem key={platform} value={platform}>
              {PLATFORM_META[platform].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selected ? <p className="text-muted-foreground text-xs">{selected.hint}</p> : null}
    </div>
  );
}
