import { escapeHtml } from "@/lib/escape-html";
import type { OrgBrand } from "@/types/org-brand";
import type { SignatureFormState } from "@/types/signature";

export type SignatureContentProps = SignatureFormState & OrgBrand;

export type SignatureTemplateProps = SignatureContentProps & {
  /** Origin only, no trailing slash (e.g. https://example.com). Used for absolute image URLs. */
  assetsBaseUrl: string;
};

const BODY_FONT = "Arial, Helvetica, sans-serif";
const HEADING_FONT = "Montserrat, Arial, Helvetica, sans-serif";

function telHref(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/[^\d+]/g, "");
  if (digits.length < 5) return null;
  return `tel:${digits}`;
}

function whatsappHref(raw: string): string | null {
  const w = raw.trim();
  if (!w) return null;
  if (/^https?:\/\//i.test(w)) return w;
  if (/^wa\.me\//i.test(w)) return `https://${w}`;
  const digits = w.replace(/[^\d]/g, "");
  if (digits.length >= 8) return `https://wa.me/${digits}`;
  return null;
}

function linkOrSpan(href: string | null, label: string, textColor: string): string {
  const safe = escapeHtml(label);
  if (!href) return `<span style="color:${escapeHtml(textColor)};">${safe}</span>`;
  return `<a href="${escapeHtml(href)}" style="color:${escapeHtml(textColor)};text-decoration:none;">${safe}</a>`;
}

/**
 * Outlook / Gmail–oriented HTML: tables + inline styles only, fixed width 500.
 * Images use absolute URLs and display:block to reduce Outlook gaps.
 * Use a public HTTPS `assetsBaseUrl` in production so image `src` values resolve for recipients (localhost is fine for dev smoke tests only).
 */
export function buildSignatureHtml(props: SignatureTemplateProps): string {
  const origin = props.assetsBaseUrl.replace(/\/+$/, "");
  const {
    fullName,
    jobTitle,
    phone,
    email,
    whatsapp,
    companyName,
    footerDisplay,
    footerUrl,
    logoUrl: orgLogoUrl,
    primaryColor,
    accentColor,
    textColor,
    mutedColor,
    borderColor,
  } = props;

  const envLogo =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_SIGNATURE_LOGO_URL
      ? process.env.NEXT_PUBLIC_SIGNATURE_LOGO_URL.trim()
      : "";
  const explicitLogo = (envLogo || orgLogoUrl || "").trim();
  const faviconUrl = origin ? `${origin}/c4-favicon.png` : "";
  const resolvedLogo = explicitLogo || faviconUrl;

  const eName = escapeHtml(fullName.trim() || "Your name");
  const eTitle = escapeHtml(jobTitle.trim() || "Your role");
  const eEmail = escapeHtml(email.trim() || "Email address");
  const eWa = escapeHtml(whatsapp.trim() || "WhatsApp");
  const eCompany = escapeHtml(companyName.trim() || "Company");
  const safeFooterHref = escapeHtml(footerUrl);
  const safeFooterLabel = escapeHtml(footerDisplay.trim() || footerUrl);

  const phoneHref = telHref(phone);
  const waHref = whatsappHref(whatsapp);

  const imgW = explicitLogo ? 180 : 40;
  const imgH = explicitLogo ? 48 : 40;
  const logoAlt = escapeHtml(companyName.trim() || "Company logo");
  const logoBlock = resolvedLogo
    ? `<img src="${escapeHtml(resolvedLogo)}" width="${imgW}" height="${imgH}" alt="${logoAlt}" style="display:block;border:0;outline:none;text-decoration:none;max-width:${imgW}px;height:auto;">`
    : `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="180" style="border:1px dashed ${escapeHtml(borderColor)};"><tr><td align="center" valign="middle" height="48" style="font-family:${BODY_FONT};font-size:11px;color:${escapeHtml(mutedColor)};padding:8px;">Company logo</td></tr></table>`;

  const safeAccent = escapeHtml(accentColor);
  const safeText = escapeHtml(textColor);
  const safeMuted = escapeHtml(mutedColor);
  const safeBorder = escapeHtml(borderColor);
  const safePrimary = escapeHtml(primaryColor);

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="500" style="width:500px;max-width:500px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td style="padding:0 0 16px 0;font-family:${BODY_FONT};font-size:14px;color:${safeText};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
    <tr>
      <td style="padding:0 0 12px 0;vertical-align:top;">
        ${logoBlock}
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 8px 0;font-family:${HEADING_FONT};font-size:13px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${safeAccent};line-height:1.3;">
        ${eCompany}
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 16px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="80" style="border-collapse:collapse;">
          <tr><td height="2" bgcolor="${safePrimary}" style="font-size:0;line-height:0;height:2px;background-color:${safePrimary};">&nbsp;</td></tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 4px 0;font-family:${HEADING_FONT};font-size:16px;font-weight:700;color:${safeText};line-height:1.3;">
        ${eName}
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 16px 0;font-family:${BODY_FONT};font-size:13px;color:${safeMuted};line-height:1.4;">
        ${eTitle}
      </td>
    </tr>
    <tr>
      <td style="padding:0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
          <tr>
            <td width="88" style="padding:0 8px 8px 0;font-family:${BODY_FONT};font-size:12px;font-weight:700;color:${safeAccent};vertical-align:top;">Phone</td>
            <td style="padding:0 0 8px 0;font-family:${BODY_FONT};font-size:13px;color:${safeText};vertical-align:top;">
              ${linkOrSpan(phoneHref, phone.trim() || "Phone number", textColor)}
            </td>
          </tr>
          <tr>
            <td width="88" style="padding:0 8px 8px 0;font-family:${BODY_FONT};font-size:12px;font-weight:700;color:${safeAccent};vertical-align:top;">Email</td>
            <td style="padding:0 0 8px 0;font-family:${BODY_FONT};font-size:13px;color:${safeText};vertical-align:top;">
              ${email.trim() ? `<a href="${escapeHtml(`mailto:${email.trim()}`)}" style="color:${safeText};text-decoration:none;">${escapeHtml(email.trim())}</a>` : `<span style="color:${safeMuted};">${eEmail}</span>`}
            </td>
          </tr>
          <tr>
            <td width="88" style="padding:0 8px 0 0;font-family:${BODY_FONT};font-size:12px;font-weight:700;color:${safeAccent};vertical-align:top;">WhatsApp</td>
            <td style="padding:0;font-family:${BODY_FONT};font-size:13px;color:${safeText};vertical-align:top;">
              ${waHref ? `<a href="${escapeHtml(waHref)}" style="color:${safeText};text-decoration:none;">${eWa}</a>` : `<span style="color:${safeMuted};">${eWa}</span>`}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 0 0 0;border-top:1px solid ${safeBorder};font-family:${BODY_FONT};font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:${safeMuted};">
        <a href="${safeFooterHref}" style="color:${safeMuted};text-decoration:none;">${safeFooterLabel}</a>
      </td>
    </tr>
  </table>
</td></tr>
</table>`;
}

/** Plain-text fallback for clipboard and older clients. */
export function buildPlainTextSignature(props: SignatureContentProps): string {
  const name = props.fullName.trim() || "Your name";
  const title = props.jobTitle.trim() || "Your role";
  const lines = [
    props.companyName.trim() || "Company",
    "",
    name,
    title,
    "",
    props.phone.trim() ? `Phone: ${props.phone.trim()}` : "Phone: ",
    props.email.trim() ? `Email: ${props.email.trim()}` : "Email: ",
    props.whatsapp.trim() ? `WhatsApp: ${props.whatsapp.trim()}` : "WhatsApp: ",
    "",
    props.footerDisplay.trim() || props.footerUrl,
  ];
  return lines.join("\n");
}
