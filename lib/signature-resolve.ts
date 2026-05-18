import { contentToFieldValues } from "@/lib/signature-render/form-to-document";
import {
  buildDocumentFromTemplate,
  fieldsFromOrgAndForm,
  hydrateTemplateBlocks,
  normalizeTemplateId,
  themeFromOrgBrand,
} from "@/lib/templates";
import type { OrgBrand } from "@/types/org-brand";
import type { SignatureDocument, TargetPlatform } from "@/types/signature-document";
import type { SignatureFormState } from "@/types/signature";
import type { SignatureRow } from "@/types/signature-row";

function isSignatureDocument(value: unknown): value is SignatureDocument {
  if (!value || typeof value !== "object") return false;
  const v = value as SignatureDocument;
  return v.version === 1 && Array.isArray(v.blocks) && typeof v.templateId === "string";
}

export function parseStoredDocument(raw: unknown): SignatureDocument | null {
  if (!raw) return null;
  const parsed = typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;
  return isSignatureDocument(parsed) ? parsed : null;
}

/** Re-apply current flat fields onto stored or template document layout. */
export function resolveSignatureDocument(input: {
  row?: Pick<SignatureRow, "template_id" | "document" | "target_platform"> | null;
  org: OrgBrand;
  member: SignatureFormState;
  assetsBaseUrl: string;
  templateId?: string;
  targetPlatform?: TargetPlatform;
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

  const stored = parseStoredDocument(input.row?.document ?? null);
  if (stored) {
    return {
      ...stored,
      templateId: normalizeTemplateId(stored.templateId || templateId),
      targetPlatform,
      theme: { ...theme, ...stored.theme },
      blocks: hydrateTemplateBlocks(stored.blocks, fields, input.assetsBaseUrl, input.org.logoUrl),
    };
  }

  return buildDocumentFromTemplate({
    templateId,
    fields,
    theme,
    targetPlatform,
    assetsBaseUrl: input.assetsBaseUrl,
    orgLogoUrl: input.org.logoUrl,
  });
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

export function buildDocumentForSave(input: {
  org: OrgBrand;
  member: SignatureFormState;
  templateId: string;
  targetPlatform: TargetPlatform;
  assetsBaseUrl: string;
}): SignatureDocument {
  const fields = contentToFieldValues({ ...input.member, ...input.org });
  return buildDocumentFromTemplate({
    templateId: input.templateId,
    fields,
    theme: themeFromOrgBrand(input.org),
    targetPlatform: input.targetPlatform,
    assetsBaseUrl: input.assetsBaseUrl,
    orgLogoUrl: input.org.logoUrl,
  });
}
