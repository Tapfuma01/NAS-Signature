import { renderSignatureDocument } from "@/lib/signature-render/render-document";
import { fieldsFromOrgAndForm } from "@/lib/templates";
import {
  resolveSignatureDocument,
  resolveSignatureDocumentAsync,
} from "@/lib/signature-resolve";
import type { OrgBrand } from "@/types/org-brand";
import type { TargetPlatform } from "@/types/signature-document";
import type { SignatureFormState } from "@/types/signature";
import type { SignatureRow } from "@/types/signature-row";
import type { SignatureTemplateDefinition } from "@/lib/templates/types";

export type RenderMemberSignatureInput = {
  org: OrgBrand;
  member: SignatureFormState;
  assetsBaseUrl: string;
  templateId: string;
  targetPlatform?: TargetPlatform;
  template?: SignatureTemplateDefinition;
  row?: Pick<SignatureRow, "template_id" | "target_platform"> | null;
};

export function renderMemberSignatureHtml(input: RenderMemberSignatureInput): string {
  const document = resolveSignatureDocument({
    org: input.org,
    member: input.member,
    assetsBaseUrl: input.assetsBaseUrl,
    templateId: input.templateId,
    targetPlatform: input.targetPlatform,
    template: input.template,
    row: input.row,
  });
  const fields = fieldsFromOrgAndForm(input.org, input.member);
  return renderSignatureDocument({
    document,
    fields,
    assetsBaseUrl: input.assetsBaseUrl,
    orgLogoUrl: input.org.logoUrl,
    options: {
      assetsBaseUrl: input.assetsBaseUrl,
      targetPlatform: input.targetPlatform ?? document.targetPlatform,
    },
  });
}

export async function renderMemberSignatureHtmlAsync(
  input: RenderMemberSignatureInput,
): Promise<string> {
  const document = await resolveSignatureDocumentAsync({
    org: input.org,
    member: input.member,
    assetsBaseUrl: input.assetsBaseUrl,
    templateId: input.templateId,
    targetPlatform: input.targetPlatform,
    row: input.row,
  });
  const fields = fieldsFromOrgAndForm(input.org, input.member);
  return renderSignatureDocument({
    document,
    fields,
    assetsBaseUrl: input.assetsBaseUrl,
    orgLogoUrl: input.org.logoUrl,
    options: {
      assetsBaseUrl: input.assetsBaseUrl,
      targetPlatform: input.targetPlatform ?? document.targetPlatform,
    },
  });
}
