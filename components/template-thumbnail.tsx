"use client";

import { useMemo } from "react";
import { renderSignatureDocument } from "@/lib/signature-render/render-document";
import { buildDocumentFromTemplate, getTemplateById } from "@/lib/templates";
import { DEFAULT_ORG_BRAND } from "@/types/org-brand";
import type { OrgBrand } from "@/types/org-brand";
import { cn } from "@/lib/utils";

const SAMPLE_FIELDS = {
  fullName: "Jane Safari",
  jobTitle: "Lead Guide",
  phone: "+27 11 123 4567",
  email: "jane@c4photosafaris.com",
  whatsapp: "+27 82 123 4567",
  companyName: DEFAULT_ORG_BRAND.companyName,
  footerDisplay: DEFAULT_ORG_BRAND.footerDisplay,
  footerUrl: DEFAULT_ORG_BRAND.footerUrl,
};

type Props = {
  templateId: string;
  org?: OrgBrand;
  className?: string;
};

export function TemplateThumbnail({ templateId, org = DEFAULT_ORG_BRAND, className }: Props) {
  const html = useMemo(() => {
    const template = getTemplateById(templateId);
    const theme = {
      primaryColor: org.primaryColor,
      accentColor: org.accentColor,
      textColor: org.textColor,
      mutedColor: org.mutedColor,
      borderColor: org.borderColor,
      ...template.themeOverrides,
    };
    const document = buildDocumentFromTemplate({
      templateId,
      fields: SAMPLE_FIELDS,
      theme,
      assetsBaseUrl: "https://signatures.example.com",
      orgLogoUrl: org.logoUrl,
    });
    return renderSignatureDocument({
      document,
      fields: SAMPLE_FIELDS,
      assetsBaseUrl: "https://signatures.example.com",
      orgLogoUrl: org.logoUrl,
    });
  }, [templateId, org]);

  return (
    <div
      className={cn(
        "bg-muted/30 relative mt-3 h-[100px] overflow-hidden rounded-md border border-border/60",
        className,
      )}
      aria-hidden
    >
      <div
        className="pointer-events-none origin-top-left bg-white"
        style={{
          transform: "scale(0.32)",
          width: "312%",
          height: "312%",
          padding: "12px",
        }}
      >
        <iframe
          title=""
          tabIndex={-1}
          srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#fff;">${html}</body></html>`}
          className="w-full border-0"
          style={{ minHeight: 200, pointerEvents: "none" }}
          sandbox=""
        />
      </div>
    </div>
  );
}
