import { contentToFieldValues } from "@/lib/signature-render/form-to-document";
import {
  buildDocumentFromTemplate,
  fieldsFromOrgAndForm,
  hydrateTemplateBlocks,
  normalizeTemplateId,
  themeFromOrgBrand,
} from "@/lib/templates";
import { getTemplateByIdAsync } from "@/lib/templates/store";
import type { SignatureTemplateDefinition } from "@/lib/templates/types";
import type { OrgBrand } from "@/types/org-brand";
import type { SignatureDocument, TargetPlatform } from "@/types/signature-document";
import type { SignatureFormState } from "@/types/signature";
import type { SignatureRow } from "@/types/signature-row";

/**
 * Resolve a signature for render/export.
 * Layout always comes from the global template; member rows supply user data only.
 */
export function resolveSignatureDocument(input: {
  org: OrgBrand;
  member: SignatureFormState;
  assetsBaseUrl: string;
  templateId?: string;
  targetPlatform?: TargetPlatform;
  /** Global template definition (pass from server after loadAllTemplates). */
  template?: SignatureTemplateDefinition;
  row?: Pick<SignatureRow, "template_id" | "target_platform"> | null;
}): SignatureDocument {
  const templateId = normalizeTemplateId(
    input.templateId ?? input.row?.template_id ?? "corporate-classic",
  );
  const targetPlatform =
    input.targetPlatform ??
    (input.row?.target_platform as TargetPlatform | undefined) ??
    "generic";
  const fields = fieldsFromOrgAndForm(input.org, input.member);
  const theme = themeFromOrgBrand(input.org);
  const template = input.template ?? undefined;

  return buildDocumentFromTemplate({
    templateId,
    template,
    fields,
    theme,
    targetPlatform,
    assetsBaseUrl: input.assetsBaseUrl,
    orgLogoUrl: input.org.logoUrl,
  });
}

/** Server-side resolve using DB-backed templates. */
export async function resolveSignatureDocumentAsync(
  input: Parameters<typeof resolveSignatureDocument>[0],
): Promise<SignatureDocument> {
  const templateId = normalizeTemplateId(
    input.templateId ?? input.row?.template_id ?? "corporate-classic",
  );
  const template = await getTemplateByIdAsync(templateId);
  return resolveSignatureDocument({ ...input, templateId, template });
}

export function documentToFormState(row: SignatureRow): SignatureFormState {
  return {
    fullName: row.name,
    jobTitle: row.job_title,
    phone: row.phone,
    email: row.email,
    whatsapp: row.whatsapp ?? "",
  };
}

/** @deprecated Signatures no longer persist layout snapshots. Kept for type compatibility. */
export function parseStoredDocument(_raw: unknown): SignatureDocument | null {
  return null;
}

export function buildDocumentForSave(input: {
  org: OrgBrand;
  member: SignatureFormState;
  templateId: string;
  targetPlatform: TargetPlatform;
  assetsBaseUrl: string;
  template?: SignatureTemplateDefinition;
}): SignatureDocument {
  const fields = contentToFieldValues({ ...input.member, ...input.org });
  return buildDocumentFromTemplate({
    templateId: input.templateId,
    template: input.template,
    fields,
    theme: themeFromOrgBrand(input.org),
    targetPlatform: input.targetPlatform,
    assetsBaseUrl: input.assetsBaseUrl,
    orgLogoUrl: input.org.logoUrl,
  });
}
