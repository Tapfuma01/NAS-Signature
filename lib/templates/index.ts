import {
  DEFAULT_TEMPLATE_ID,
  SIGNATURE_TEMPLATES,
  getTemplateById as getCatalogTemplateById,
} from "@/lib/templates/catalog";
import { normalizeTemplateId as normalizeTemplateIdStore } from "@/lib/templates/store";
import type { SignatureTemplateDefinition } from "@/lib/templates/types";
import { resolveLogoUrl } from "@/lib/signature-render/utils";
import type { OrgBrand } from "@/types/org-brand";
import type {
  SignatureBlock,
  SignatureDocument,
  SignatureFieldValues,
  TargetPlatform,
} from "@/types/signature-document";

export { SIGNATURE_TEMPLATES, DEFAULT_TEMPLATE_ID } from "@/lib/templates/catalog";
export type {
  SignatureTemplateDefinition,
  TemplateCategory,
  TemplateLayoutStyle,
} from "@/lib/templates/types";
export { TEMPLATE_LAYOUT_STYLES } from "@/lib/templates/types";

export function getLayoutStyle(templateId: string) {
  return getTemplateById(normalizeTemplateId(templateId)).layoutStyle;
}

export function getTemplateById(id: string): SignatureTemplateDefinition {
  return getCatalogTemplateById(id);
}

export function normalizeTemplateId(id: string | null | undefined): string {
  return normalizeTemplateIdStore(id);
}

export {
  loadAllTemplates,
  getTemplateByIdAsync,
  getTemplateDocument,
} from "@/lib/templates/store";

function cloneBlocks(blocks: SignatureBlock[]): SignatureBlock[] {
  return JSON.parse(JSON.stringify(blocks)) as SignatureBlock[];
}

/** Fill heading/footer/logo/social placeholders from live field values. */
export function hydrateTemplateBlocks(
  blocks: SignatureBlock[],
  fields: SignatureFieldValues,
  assetsBaseUrl: string,
  orgLogoUrl: string,
  customFields?: Record<string, string>,
): SignatureBlock[] {
  const logo = resolveLogoUrl(assetsBaseUrl, orgLogoUrl);
  return cloneBlocks(blocks).map((block) => {
    switch (block.type) {
      case "logo":
        return {
          ...block,
          src: logo.url,
          width: logo.width,
          height: logo.height,
        };
      case "heading":
        if (block.level === "company") {
          return { ...block, text: fields.companyName.trim() || "Company" };
        }
        if (block.level === "name") {
          return { ...block, text: fields.fullName.trim() || "Your name" };
        }
        return { ...block, text: fields.jobTitle.trim() || "Your role" };
      case "footer_link":
        return {
          ...block,
          label: fields.footerDisplay.trim() || fields.footerUrl,
          url: fields.footerUrl,
        };
      case "social":
        return {
          ...block,
          items: block.items.map((item, i) => ({
            ...item,
            url:
              i === 0 && !item.url.trim()
                ? fields.footerUrl
                : item.url,
          })),
        };
      case "contact_row":
        if (block.valueField !== "custom") return block;
        return {
          ...block,
          customValue: customFields?.[block.id]?.trim() || block.customValue || "",
        };
      default:
        return block;
    }
  });
}

export function buildDocumentFromTemplate(input: {
  templateId: string;
  fields: SignatureFieldValues;
  theme: SignatureDocument["theme"];
  targetPlatform?: TargetPlatform;
  assetsBaseUrl: string;
  orgLogoUrl: string;
  customFields?: Record<string, string>;
  template?: SignatureTemplateDefinition;
}): SignatureDocument {
  const template =
    input.template ?? getTemplateById(normalizeTemplateId(input.templateId));
  const theme = { ...input.theme, ...template.themeOverrides };
  return {
    version: 1,
    templateId: template.id,
    targetPlatform: input.targetPlatform ?? "generic",
    canvasWidth: template.canvasWidth,
    blocks: hydrateTemplateBlocks(
      template.blocks,
      input.fields,
      input.assetsBaseUrl,
      input.orgLogoUrl,
      input.customFields,
    ),
    theme,
  };
}

export function themeFromOrgBrand(org: OrgBrand): SignatureDocument["theme"] {
  return {
    primaryColor: org.primaryColor,
    accentColor: org.accentColor,
    textColor: org.textColor,
    mutedColor: org.mutedColor,
    borderColor: org.borderColor,
  };
}

export function fieldsFromOrgAndForm(
  org: OrgBrand,
  form: { fullName: string; jobTitle: string; phone: string; email: string; whatsapp: string },
): SignatureFieldValues {
  return {
    fullName: form.fullName,
    jobTitle: form.jobTitle,
    phone: form.phone,
    email: form.email,
    whatsapp: form.whatsapp,
    companyName: org.companyName,
    footerDisplay: org.footerDisplay,
    footerUrl: org.footerUrl,
  };
}
