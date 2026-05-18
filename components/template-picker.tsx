"use client";

import { TemplateThumbnail } from "@/components/template-thumbnail";
import { Badge } from "@/components/ui/badge";
import { SIGNATURE_TEMPLATES } from "@/lib/templates";
import type { TemplateCategory } from "@/lib/templates/types";
import type { OrgBrand } from "@/types/org-brand";
import { cn } from "@/lib/utils";

const CATEGORY_STYLES: Record<TemplateCategory, string> = {
  Corporate: "border-l-primary",
  Creative: "border-l-violet-500",
  Minimal: "border-l-zinc-400",
  Social: "border-l-sky-500",
  Legal: "border-l-amber-600",
  Photo: "border-l-emerald-600",
};

type Props = {
  value: string;
  onChange: (templateId: string) => void;
  disabled?: boolean;
  className?: string;
  org?: OrgBrand;
};

export function TemplatePicker({ value, onChange, disabled, className, org }: Props) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {SIGNATURE_TEMPLATES.map((template) => {
        const selected = value === template.id;
        return (
          <button
            key={template.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(template.id)}
            className={cn(
              "rounded-lg border border-l-4 bg-card p-4 text-left transition-colors",
              CATEGORY_STYLES[template.category],
              selected
                ? "border-primary ring-2 ring-primary/30"
                : "border-border hover:border-primary/40",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{template.name}</p>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{template.description}</p>
              </div>
              <Badge variant={selected ? "default" : "secondary"} className="shrink-0 text-[10px] uppercase">
                {template.category}
              </Badge>
            </div>
            <TemplateThumbnail templateId={template.id} org={org} />
          </button>
        );
      })}
    </div>
  );
}
