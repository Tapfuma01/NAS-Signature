"use client";

import { SignatureHtmlPreview } from "@/components/signature-html-preview";
import type { OrgBrand } from "@/types/org-brand";
import type { TargetPlatform } from "@/types/signature-document";
import type { SignatureFormState } from "@/types/signature";
import type { SignatureRow } from "@/types/signature-row";

type Props = {
  org: OrgBrand;
  member: SignatureFormState;
  templateId?: string;
  targetPlatform?: TargetPlatform;
  assetsBaseUrl?: string;
  storedRow?: Pick<SignatureRow, "template_id" | "document" | "target_platform"> | null;
  /** Section title above preview; pass empty string to hide. */
  eyebrow?: string;
  compact?: boolean;
};

export function TemplateWrapper({
  org,
  member,
  templateId = "corporate-classic",
  targetPlatform = "generic",
  assetsBaseUrl = "",
  storedRow,
  eyebrow = "Live preview",
  compact,
}: Props) {
  const origin =
    assetsBaseUrl ||
    (typeof window !== "undefined" && window.location.origin ? window.location.origin : "");

  return (
    <div className="flex flex-col gap-4">
      {eyebrow ? <p className="safari-section-eyebrow text-xs md:text-sm">{eyebrow}</p> : null}
      <SignatureHtmlPreview
        org={org}
        member={member}
        templateId={templateId}
        targetPlatform={targetPlatform}
        assetsBaseUrl={origin}
        storedRow={storedRow}
        compact={compact}
      />
    </div>
  );
}
