"use client";

import { SignatureCopyPanel } from "@/components/signature-copy-panel";
import { TemplateWrapper } from "@/components/TemplateWrapper";
import { buildPlainTextSignature } from "@/components/SignatureTemplate";
import { renderMemberSignatureHtml } from "@/lib/signature-render/render-member";
import type { SignatureTemplateDefinition } from "@/lib/templates/types";
import type { OrgBrand } from "@/types/org-brand";
import type { TargetPlatform } from "@/types/signature-document";
import type { SignatureFormState } from "@/types/signature";
import type { SignatureRow } from "@/types/signature-row";
import { useState } from "react";

type Props = {
  org: OrgBrand;
  member: SignatureFormState;
  assetsBaseUrl: string;
  template: SignatureTemplateDefinition;
  signatureRow: Pick<SignatureRow, "template_id" | "target_platform" | "slug">;
};

export function PublicSignatureClient({
  org,
  member,
  assetsBaseUrl,
  template,
  signatureRow,
}: Props) {
  const [targetPlatform, setTargetPlatform] = useState<TargetPlatform>(
    signatureRow.target_platform ?? "generic",
  );
  const templateId = template.id;
  const content = { ...member, ...org };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
      <TemplateWrapper
        org={org}
        member={member}
        templateId={templateId}
        template={template}
        targetPlatform={targetPlatform}
        assetsBaseUrl={assetsBaseUrl}
        storedRow={signatureRow}
        eyebrow=""
      />
      <SignatureCopyPanel
        targetPlatform={targetPlatform}
        onPlatformChange={setTargetPlatform}
        disabled={!member.fullName.trim()}
        downloadBasename={`${signatureRow.slug}-signature`}
        buildHtml={() =>
          renderMemberSignatureHtml({
            org,
            member,
            assetsBaseUrl,
            templateId,
            template,
            targetPlatform,
            row: signatureRow,
          })
        }
        plainText={buildPlainTextSignature(content)}
      />
    </div>
  );
}
