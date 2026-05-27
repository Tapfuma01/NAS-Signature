/** CSS font-family for signature HTML (inline styles). Falls back when Aptos is not installed. */
export const SIGNATURE_FONT_STACK = "Aptos, 'Segoe UI', Arial, Helvetica, sans-serif";

const FONT_DIR = "/Fonts";

const FACES = [
  { file: "Aptos.ttf", weight: 400, style: "normal" },
  { file: "Aptos-Italic.ttf", weight: 400, style: "italic" },
  { file: "Aptos-SemiBold.ttf", weight: 600, style: "normal" },
  { file: "Aptos-Bold.ttf", weight: 700, style: "normal" },
  { file: "Aptos-Bold-Italic.ttf", weight: 700, style: "italic" },
] as const;

function fontFileUrl(assetsBaseUrl: string | undefined, file: string): string {
  const encoded = encodeURIComponent(file);
  if (assetsBaseUrl?.trim()) {
    return `${assetsBaseUrl.replace(/\/$/, "")}${FONT_DIR}/${encoded}`;
  }
  return `${FONT_DIR}/${encoded}`;
}

/** @font-face rules for signature preview iframes (browser only; not for pasted email HTML). */
export function signaturePreviewFontFaceCss(assetsBaseUrl?: string): string {
  return FACES.map(
    ({ file, weight, style }) => `@font-face {
  font-family: 'Aptos';
  src: url('${fontFileUrl(assetsBaseUrl, file)}') format('truetype');
  font-weight: ${weight};
  font-style: ${style};
  font-display: swap;
}`,
  ).join("\n");
}

export function wrapSignaturePreviewDocument(html: string, assetsBaseUrl?: string): string {
  const css = signaturePreviewFontFaceCss(assetsBaseUrl);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body style="margin:0;padding:0;background:#fff;">${html}</body></html>`;
}
