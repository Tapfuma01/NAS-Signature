import { escapeHtml } from "@/lib/escape-html";
import { compileBlocksToRows } from "@/lib/signature-render/compile-blocks";
import { getRenderProfile } from "@/lib/signature-render/profiles";
import type {
  RenderSignatureOptions,
  SignatureDocument,
  SignatureFieldValues,
  TargetPlatform,
} from "@/types/signature-document";

export type RenderSignatureDocumentInput = {
  document: SignatureDocument;
  fields: SignatureFieldValues;
  assetsBaseUrl: string;
  orgLogoUrl: string;
  options?: RenderSignatureOptions;
};

/**
 * Compiles a SignatureDocument to email-safe HTML for the given target platform.
 * Does not emit React/Tailwind — tables and inline styles only.
 */
export function renderSignatureDocument(input: RenderSignatureDocumentInput): string {
  const platform: TargetPlatform =
    input.options?.targetPlatform ?? input.document.targetPlatform ?? "generic";
  const profile = getRenderProfile(platform);
  const width = input.document.canvasWidth;
  const { theme } = input.document;

  const ctx = {
    profile,
    theme,
    fields: input.fields,
    assetsBaseUrl: input.assetsBaseUrl,
    orgLogoUrl: input.orgLogoUrl,
    canvasWidth: width,
    templateId: input.document.templateId,
  };

  const innerRows = compileBlocksToRows(input.document.blocks, ctx);
  const safeText = escapeHtml(theme.textColor);

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${width}" style="width:${width}px;max-width:${width}px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td style="padding:0 0 16px 0;font-family:${profile.bodyFont};font-size:14px;color:${safeText};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
    ${innerRows}
  </table>
</td></tr>
</table>`;
}
