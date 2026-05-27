import type { TargetPlatform } from "@/types/signature-document";

/**
 * Wrap signature table HTML for clipboard consumers.
 * Outlook desktop paste often works better with a fragment marker and Office namespaces.
 */
export function wrapHtmlForClipboard(html: string, platform: TargetPlatform): string {
  const trimmed = html.trim();
  if (!trimmed) return trimmed;

  if (platform === "outlook_desktop" || platform === "microsoft_365") {
    return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!--[if mso]><style type="text/css">body, table, td { font-family: Aptos, 'Segoe UI', Arial, Helvetica, sans-serif; }</style><![endif]-->
</head>
<body style="margin:0;padding:0;">
<!--StartFragment-->
${trimmed}
<!--EndFragment-->
</body>
</html>`;
  }

  if (platform === "google_workspace") {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;">${trimmed}</body></html>`;
  }

  return trimmed;
}

/** Full .htm file for IT distribution (Outlook desktop). */
export function buildOutlookHtmFile(html: string, title = "Email signature"): string {
  return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<title>${escapeXml(title)}</title>
</head>
<body style="margin:0;padding:8px;">
${html.trim()}
</body>
</html>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function downloadHtmlFile(html: string, filename: string): void {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
