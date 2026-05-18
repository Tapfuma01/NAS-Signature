"use client";

import { SignatureCopyPanel } from "@/components/signature-copy-panel";
import { TemplateWrapper } from "@/components/TemplateWrapper";
import { buildPlainTextSignature, buildSignatureHtml } from "@/components/SignatureTemplate";
import { normalizeTemplateId } from "@/lib/templates";
import type { OrgBrand } from "@/types/org-brand";
import type { TargetPlatform } from "@/types/signature-document";
import type { SignatureFormState } from "@/types/signature";
import type { SignatureRow } from "@/types/signature-row";
import { useState } from "react";

type Props = {
  org: OrgBrand;
  member: SignatureFormState;
  assetsBaseUrl: string;
  signatureRow: Pick<SignatureRow, "template_id" | "document" | "target_platform" | "slug">;
};

export function PublicSignatureClient({ org, member, assetsBaseUrl, signatureRow }: Props) {
  const [targetPlatform, setTargetPlatform] = useState<TargetPlatform>(
    signatureRow.target_platform ?? "generic",
  );
  const templateId = normalizeTemplateId(signatureRow.template_id);
  const content = { ...member, ...org };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
      <TemplateWrapper
        org={org}
        member={member}
        templateId={templateId}
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
          buildSignatureHtml({
            ...content,
            assetsBaseUrl,
            templateId,
            renderPlatform: targetPlatform,
          })
        }
        plainText={buildPlainTextSignature(content)}
      />
    </div>
  );
}
