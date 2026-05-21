"use client";

import { useMemo } from "react";
import { renderSignatureDocument } from "@/lib/signature-render/render-document";
import { resolveSignatureDocument } from "@/lib/signature-resolve";
import type { OrgBrand } from "@/types/org-brand";
import type { SignatureDocument, TargetPlatform } from "@/types/signature-document";
import type { SignatureFormState } from "@/types/signature";
import type { SignatureTemplateDefinition } from "@/lib/templates/types";
import type { SignatureRow } from "@/types/signature-row";

type Props = {
  org: OrgBrand;
  member: SignatureFormState;
  templateId: string;
  template?: SignatureTemplateDefinition;
  targetPlatform?: TargetPlatform;
  assetsBaseUrl: string;
  storedRow?: Pick<SignatureRow, "template_id" | "target_platform"> | null;
  /** When set, renders this document directly (editor WYSIWYG). */
  document?: SignatureDocument;
  className?: string;
  /** Scale down for admin table thumbnails */
  compact?: boolean;
};

export function SignatureHtmlPreview({
  org,
  member,
  templateId,
  template,
  targetPlatform = "generic",
  assetsBaseUrl,
  storedRow,
  document: documentOverride,
  className,
  compact,
}: Props) {
  const html = useMemo(() => {
    const document =
      documentOverride ??
      resolveSignatureDocument({
        row: storedRow ?? { template_id: templateId, target_platform: targetPlatform },
        org,
        member,
        assetsBaseUrl,
        templateId,
        template,
        targetPlatform,
      });
    const fields = {
      fullName: member.fullName,
      jobTitle: member.jobTitle,
      phone: member.phone,
      email: member.email,
      whatsapp: member.whatsapp,
      companyName: org.companyName,
      footerDisplay: org.footerDisplay,
      footerUrl: org.footerUrl,
    };
    return renderSignatureDocument({
      document,
      fields,
      assetsBaseUrl,
      orgLogoUrl: org.logoUrl,
      options: { assetsBaseUrl, targetPlatform },
    });
  }, [org, member, templateId, template, targetPlatform, assetsBaseUrl, storedRow, documentOverride]);

  return (
    <div
      className={className}
      style={
        compact
          ? { transform: "scale(0.42)", transformOrigin: "top left", width: "238%", height: "238%" }
          : undefined
      }
    >
      <div
        className="overflow-hidden rounded-xl border bg-white p-4 shadow-sm"
        style={{ borderColor: org.borderColor }}
      >
        <iframe
          title="Signature preview"
          srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#fff;">${html}</body></html>`}
          className="w-full border-0"
          style={{ minHeight: compact ? 200 : 280 }}
          sandbox=""
        />
      </div>
    </div>
  );
}
