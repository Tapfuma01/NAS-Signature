import { escapeHtml } from "@/lib/escape-html";
import { resolveExportAssetsBaseUrl, toAbsoluteHttpsImageUrl } from "@/lib/signature-render/image-url";

export const BODY_FONT_SAFE = "Arial, Helvetica, sans-serif";
export const HEADING_FONT_LEGACY = "Montserrat, Arial, Helvetica, sans-serif";

export function telHref(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/[^\d+]/g, "");
  if (digits.length < 5) return null;
  return `tel:${digits}`;
}

export function whatsappHref(raw: string): string | null {
  const w = raw.trim();
  if (!w) return null;
  if (/^https?:\/\//i.test(w)) return w;
  if (/^wa\.me\//i.test(w)) return `https://${w}`;
  const digits = w.replace(/[^\d]/g, "");
  if (digits.length >= 8) return `https://wa.me/${digits}`;
  return null;
}

export function linkOrSpan(href: string | null, label: string, textColor: string): string {
  const safe = escapeHtml(label);
  if (!href) return `<span style="color:${escapeHtml(textColor)};">${safe}</span>`;
  return `<a href="${escapeHtml(href)}" style="color:${escapeHtml(textColor)};text-decoration:none;">${safe}</a>`;
}

export function resolveLogoUrl(
  assetsBaseUrl: string,
  orgLogoUrl: string,
  explicitSrc?: string,
): { url: string; width: number; height: number; isPlaceholder: boolean } {
  const origin = resolveExportAssetsBaseUrl(assetsBaseUrl);
  const envLogo =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_SIGNATURE_LOGO_URL
      ? process.env.NEXT_PUBLIC_SIGNATURE_LOGO_URL.trim()
      : "";
  const explicitLogo = (explicitSrc?.trim() || envLogo || orgLogoUrl || "").trim();
  const faviconPath = "/c4-favicon.jpg";
  const rawResolved = explicitLogo || (origin ? `${origin}${faviconPath}` : "");
  const resolvedLogo = rawResolved ? toAbsoluteHttpsImageUrl(rawResolved, origin) : "";
  const hasCustomLogo = Boolean(explicitLogo);
  return {
    url: resolvedLogo,
    width: hasCustomLogo ? 180 : 40,
    height: hasCustomLogo ? 48 : 40,
    isPlaceholder: !resolvedLogo,
  };
}
