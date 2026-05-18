"use client";

import { SignaturePreview } from "@/components/signature-preview";
import type { OrgBrand } from "@/types/org-brand";
import type { SignatureFormState } from "@/types/signature";

type Props = {
  org: OrgBrand;
  member: SignatureFormState;
  /** Section title above preview; pass empty string to hide. */
  eyebrow?: string;
};

export function TemplateWrapper({ org, member, eyebrow = "Live preview" }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {eyebrow ? <p className="safari-section-eyebrow text-xs md:text-sm">{eyebrow}</p> : null}
      <SignaturePreview org={org} value={member} />
    </div>
  );
}
