import { buildDocumentFromTemplate, normalizeTemplateId, themeFromOrgBrand } from "@/lib/templates";
import type { OrgBrand } from "@/types/org-brand";
import type { SignatureDocument, SignatureFieldValues, TargetPlatform } from "@/types/signature-document";
import type { SignatureFormState } from "@/types/signature";

export type SignatureContentInput = SignatureFormState &
  OrgBrand & {
    assetsBaseUrl: string;
    templateId?: string;
    targetPlatform?: TargetPlatform;
  };

export function contentToFieldValues(input: SignatureFormState & OrgBrand): SignatureFieldValues {
  return {
    fullName: input.fullName,
    jobTitle: input.jobTitle,
    phone: input.phone,
    email: input.email,
    whatsapp: input.whatsapp,
    companyName: input.companyName,
    footerDisplay: input.footerDisplay,
    footerUrl: input.footerUrl,
  };
}

/** Build a SignatureDocument from form + org + template catalog. */
export function formToDocument(input: SignatureContentInput): SignatureDocument {
  const fields = contentToFieldValues(input);
  return buildDocumentFromTemplate({
    templateId: normalizeTemplateId(input.templateId),
    fields,
    theme: themeFromOrgBrand(input),
    targetPlatform: input.targetPlatform ?? "generic",
    assetsBaseUrl: input.assetsBaseUrl,
    orgLogoUrl: input.logoUrl,
    customFields: input.customFields,
  });
}
