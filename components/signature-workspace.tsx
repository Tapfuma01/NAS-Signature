"use client";

import Image from "next/image";
import { useState } from "react";
import { DetailsForm } from "@/components/details-form";
import { SignatureCopyPanel } from "@/components/signature-copy-panel";
import { TemplateWrapper } from "@/components/TemplateWrapper";
import { buildPlainTextSignature } from "@/components/SignatureTemplate";
import { ThemeToggle } from "@/components/theme-toggle";
import { getExportAssetsBaseUrl } from "@/lib/export-base-url";
import { renderMemberSignatureHtml } from "@/lib/signature-render/render-member";
import type { SignatureTemplateDefinition } from "@/lib/templates/types";
import type { OrgBrand } from "@/types/org-brand";
import type { TargetPlatform } from "@/types/signature-document";
import { emptySignatureForm, type SignatureFormState } from "@/types/signature";

type Props = {
  org: OrgBrand;
  template: SignatureTemplateDefinition;
  defaultTargetPlatform?: TargetPlatform;
};

export function SignatureWorkspace({
  org,
  template,
  defaultTargetPlatform = "generic",
}: Props) {
  const [form, setForm] = useState<SignatureFormState>(emptySignatureForm);
  const templateId = template.id;
  const [targetPlatform, setTargetPlatform] = useState<TargetPlatform>(defaultTargetPlatform);
  const content = { ...form, ...org };

  const assetsBaseUrl =
    typeof window !== "undefined"
      ? getExportAssetsBaseUrl(window.location.origin)
      : getExportAssetsBaseUrl();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <header className="shrink-0 border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/logo-white.png"
                alt="C4 Photo Safaris"
                width={160}
                height={40}
                className="hidden h-8 w-auto dark:block"
                priority
              />
              <span className="font-heading text-lg font-semibold tracking-tight dark:hidden">
                C4 Photo Safaris
              </span>
            </div>
            <div className="hidden min-h-6 border-l border-border sm:block" aria-hidden />
            <p className="section-subtitle text-xs md:text-sm">Email signature generator</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-5 py-8 md:px-8 lg:flex-row lg:gap-10">
        <section className="flex flex-1 flex-col gap-6 lg:max-w-md">
          <DetailsForm value={form} onChange={setForm} />
          <p className="text-muted-foreground text-xs leading-relaxed">
            Your company signature uses the <span className="font-medium text-foreground">{template.name}</span> layout.
            Enter your details below, then copy or download your signature.
          </p>
        </section>
        <section className="flex-1 lg:min-w-0">
          <TemplateWrapper
            org={org}
            member={form}
            templateId={templateId}
            template={template}
            targetPlatform={targetPlatform}
            assetsBaseUrl={assetsBaseUrl}
          />
          <div className="mt-8 border-t border-border pt-8">
            <SignatureCopyPanel
              targetPlatform={targetPlatform}
              onPlatformChange={setTargetPlatform}
              disabled={!form.fullName.trim()}
              downloadBasename="signature-preview"
              buildHtml={() =>
                renderMemberSignatureHtml({
                  org,
                  member: form,
                  assetsBaseUrl,
                  templateId,
                  template,
                  targetPlatform,
                })
              }
              plainText={buildPlainTextSignature(content)}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
