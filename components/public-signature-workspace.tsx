"use client";

import { useState, useTransition } from "react";
import { updateMemberDetailsPublic } from "@/app/actions/public-signature";
import { DetailsForm } from "@/components/details-form";
import { SignatureCopyPanel } from "@/components/signature-copy-panel";
import { TemplateWrapper } from "@/components/TemplateWrapper";
import { buildPlainTextSignature } from "@/components/SignatureTemplate";
import { Button } from "@/components/ui/button";
import { renderMemberSignatureHtml } from "@/lib/signature-render/render-member";
import type { SignatureTemplateDefinition } from "@/lib/templates/types";
import type { OrgBrand } from "@/types/org-brand";
import type { TargetPlatform } from "@/types/signature-document";
import type { SignatureFormState } from "@/types/signature";
import type { SignatureRow } from "@/types/signature-row";
import { toast } from "sonner";

type Props = {
  org: OrgBrand;
  initialMember: SignatureFormState;
  assetsBaseUrl: string;
  template: SignatureTemplateDefinition;
  signatureRow: Pick<SignatureRow, "template_id" | "target_platform" | "slug">;
  canEdit: boolean;
  editToken?: string;
};

export function PublicSignatureWorkspace({
  org,
  initialMember,
  assetsBaseUrl,
  template,
  signatureRow,
  canEdit,
  editToken,
}: Props) {
  const [member, setMember] = useState<SignatureFormState>(initialMember);
  const [targetPlatform, setTargetPlatform] = useState<TargetPlatform>(
    signatureRow.target_platform ?? "generic",
  );
  const [pending, startTransition] = useTransition();
  const templateId = template.id;
  const content = { ...member, ...org };

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit || !editToken) return;
    if (!member.fullName.trim()) {
      toast.error("Enter your full name");
      return;
    }
    if (!member.email.trim()) {
      toast.error("Enter your email address");
      return;
    }

    startTransition(async () => {
      const res = await updateMemberDetailsPublic({
        slug: signatureRow.slug,
        token: editToken,
        fullName: member.fullName,
        jobTitle: member.jobTitle,
        email: member.email,
        phone: member.phone,
        whatsapp: member.whatsapp || null,
      });
      if (res.ok) {
        toast.success("Details saved");
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
      {canEdit ? (
        <section className="rounded-xl border bg-muted/20 p-5 md:p-6">
          <h2 className="font-heading mb-1 text-lg font-semibold tracking-tight">Edit your details</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Update your information below, then save before copying your signature.
          </p>
          <form onSubmit={onSave} className="flex flex-col gap-4">
            <DetailsForm value={member} onChange={setMember} disabled={pending} />
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save details"}
            </Button>
          </form>
        </section>
      ) : (
        <p className="text-muted-foreground text-center text-sm">
          Use the link from your email to edit your details. You can still copy your signature below.
        </p>
      )}

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
