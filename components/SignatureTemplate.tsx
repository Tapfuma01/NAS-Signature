import { plainTextFromContent, renderSignatureFromContent } from "@/lib/signature-render";
import type { OrgBrand } from "@/types/org-brand";
import type { SignatureFormState } from "@/types/signature";
import type { TargetPlatform } from "@/types/signature-document";

export type SignatureContentProps = SignatureFormState & OrgBrand;

export type SignatureTemplateProps = SignatureContentProps & {
  /** Origin only, no trailing slash (e.g. https://example.com). Used for absolute image URLs. */
  assetsBaseUrl: string;
  templateId?: string;
  /** Override export profile for this render (defaults to generic). */
  renderPlatform?: TargetPlatform;
};

/**
 * Outlook / Gmail–oriented HTML: tables + inline styles only.
 * Compiled from SignatureDocument via platform render profiles.
 */
export function buildSignatureHtml(props: SignatureTemplateProps): string {
  return renderSignatureFromContent({
    ...props,
    templateId: props.templateId,
    renderPlatform: props.renderPlatform ?? "generic",
  });
}

/** Plain-text fallback for clipboard and older clients. */
export function buildPlainTextSignature(props: SignatureContentProps): string {
  return plainTextFromContent(props);
}
