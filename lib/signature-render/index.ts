import { contentToFieldValues, formToDocument, type SignatureContentInput } from "@/lib/signature-render/form-to-document";
import { buildPlainTextFromDocument } from "@/lib/signature-render/plain-text";
import { renderSignatureDocument } from "@/lib/signature-render/render-document";
import type { OrgBrand } from "@/types/org-brand";
import type { RenderSignatureOptions, SignatureDocument, TargetPlatform } from "@/types/signature-document";
import type { SignatureFormState } from "@/types/signature";

export type SignatureContentProps = SignatureFormState & OrgBrand;

export { formToDocument, contentToFieldValues, type SignatureContentInput };
export { renderSignatureDocument, type RenderSignatureDocumentInput } from "@/lib/signature-render/render-document";
export { buildPlainTextFromDocument } from "@/lib/signature-render/plain-text";
export { getRenderProfile } from "@/lib/signature-render/profiles";
export type { RenderProfile } from "@/lib/signature-render/profiles/types";

export type RenderFromContentProps = SignatureContentProps & {
  assetsBaseUrl: string;
  templateId?: string;
  targetPlatform?: TargetPlatform;
  /** Override platform for this render only (e.g. copy button). */
  renderPlatform?: TargetPlatform;
};

/** Build HTML from flat form + org brand (backward-compatible entry point). */
export function renderSignatureFromContent(props: RenderFromContentProps): string {
  const document = formToDocument(props);
  const fields = contentToFieldValues(props);
  const options: RenderSignatureOptions | undefined = props.renderPlatform
    ? { assetsBaseUrl: props.assetsBaseUrl, targetPlatform: props.renderPlatform }
    : props.targetPlatform
      ? { assetsBaseUrl: props.assetsBaseUrl, targetPlatform: props.targetPlatform }
      : { assetsBaseUrl: props.assetsBaseUrl };

  return renderSignatureDocument({
    document,
    fields,
    assetsBaseUrl: props.assetsBaseUrl,
    orgLogoUrl: props.logoUrl,
    options: {
      ...options,
      targetPlatform: props.renderPlatform ?? props.targetPlatform ?? document.targetPlatform,
    },
  });
}

export function plainTextFromContent(props: SignatureContentProps): string {
  const document = formToDocument({ ...props, assetsBaseUrl: "" });
  return buildPlainTextFromDocument(document, contentToFieldValues(props));
}

export function renderDocumentWithFields(
  document: SignatureDocument,
  fields: ReturnType<typeof contentToFieldValues>,
  assetsBaseUrl: string,
  orgLogoUrl: string,
  targetPlatform?: TargetPlatform,
): string {
  return renderSignatureDocument({
    document,
    fields,
    assetsBaseUrl,
    orgLogoUrl,
    options: targetPlatform ? { assetsBaseUrl, targetPlatform } : { assetsBaseUrl },
  });
}
