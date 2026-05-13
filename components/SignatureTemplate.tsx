import { escapeHtml } from "@/lib/escape-html";
import type { SignatureFormState } from "@/types/signature";

export type SignatureTemplateProps = SignatureFormState & {
  /** Origin only, no trailing slash (e.g. https://example.com). Used for absolute image URLs. */
  assetsBaseUrl: string;
  /** Optional absolute URL for the company logo image. */
  logoUrl?: string;
};

const GOLD = "#C69C6D";
const TEXT = "#1a1a1a";
const MUTED = "#6b6b64";
const BORDER = "#e8ddd0";
const BODY_FONT = 'Arial, Helvetica, sans-serif';
const HEADING_FONT = 'Montserrat, Arial, Helvetica, sans-serif';

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

function linkOrSpan(href: string | null, label: string): string {
  const safe = escapeHtml(label);
  if (!href) return `<span style="color:${TEXT};">${safe}</span>`;
  return `<a href="${escapeHtml(href)}" style="color:${TEXT};text-decoration:none;">${safe}</a>`;
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
    logoUrl: logoUrlProp,
  } = props;

  const envLogo =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_SIGNATURE_LOGO_URL
      ? process.env.NEXT_PUBLIC_SIGNATURE_LOGO_URL.trim()
      : "";
  const explicitLogo = (logoUrlProp || envLogo || "").trim();
  const faviconUrl = origin ? `${origin}/c4-favicon.png` : "";
  const resolvedLogo = explicitLogo || faviconUrl;

  const eName = escapeHtml(fullName.trim() || "Your name");
  const eTitle = escapeHtml(jobTitle.trim() || "Your role");
  const eEmail = escapeHtml(email.trim() || "Email address");
  const eWa = escapeHtml(whatsapp.trim() || "WhatsApp");

  const phoneHref = telHref(phone);
  const waHref = whatsappHref(whatsapp);

  const imgW = explicitLogo ? 180 : 40;
  const imgH = explicitLogo ? 48 : 40;
  const logoBlock = resolvedLogo
    ? `<img src="${escapeHtml(resolvedLogo)}" width="${imgW}" height="${imgH}" alt="C4 Photo Safaris" style="display:block;border:0;outline:none;text-decoration:none;max-width:${imgW}px;height:auto;">`
    : `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="180" style="border:1px dashed ${BORDER};"><tr><td align="center" valign="middle" height="48" style="font-family:${BODY_FONT};font-size:11px;color:${MUTED};padding:8px;">Company logo</td></tr></table>`;

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="500" style="width:500px;max-width:500px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td style="padding:0 0 16px 0;font-family:${BODY_FONT};font-size:14px;color:${TEXT};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
    <tr>
      <td style="padding:0 0 12px 0;vertical-align:top;">
        ${logoBlock}
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 8px 0;font-family:${HEADING_FONT};font-size:13px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${GOLD};line-height:1.3;">
        C4 Photo Safaris
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 16px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="80" style="border-collapse:collapse;">
          <tr><td height="2" bgcolor="${GOLD}" style="font-size:0;line-height:0;height:2px;background-color:${GOLD};">&nbsp;</td></tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 4px 0;font-family:${HEADING_FONT};font-size:16px;font-weight:700;color:${TEXT};line-height:1.3;">
        ${eName}
      </td>
    </tr>
    <tr>
      <td style="padding:0 0 16px 0;font-family:${BODY_FONT};font-size:13px;color:#3d3d38;line-height:1.4;">
        ${eTitle}
      </td>
    </tr>
    <tr>
      <td style="padding:0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
          <tr>
            <td width="88" style="padding:0 8px 8px 0;font-family:${BODY_FONT};font-size:12px;font-weight:700;color:${GOLD};vertical-align:top;">Phone</td>
            <td style="padding:0 0 8px 0;font-family:${BODY_FONT};font-size:13px;color:${TEXT};vertical-align:top;">
              ${linkOrSpan(phoneHref, phone.trim() || "Phone number")}
            </td>
          </tr>
          <tr>
            <td width="88" style="padding:0 8px 8px 0;font-family:${BODY_FONT};font-size:12px;font-weight:700;color:${GOLD};vertical-align:top;">Email</td>
            <td style="padding:0 0 8px 0;font-family:${BODY_FONT};font-size:13px;color:${TEXT};vertical-align:top;">
              ${email.trim() ? `<a href="${escapeHtml(`mailto:${email.trim()}`)}" style="color:${TEXT};text-decoration:none;">${escapeHtml(email.trim())}</a>` : `<span style="color:${MUTED};">${eEmail}</span>`}
            </td>
          </tr>
          <tr>
            <td width="88" style="padding:0 8px 0 0;font-family:${BODY_FONT};font-size:12px;font-weight:700;color:${GOLD};vertical-align:top;">WhatsApp</td>
            <td style="padding:0;font-family:${BODY_FONT};font-size:13px;color:${TEXT};vertical-align:top;">
              ${waHref ? `<a href="${escapeHtml(waHref)}" style="color:${TEXT};text-decoration:none;">${eWa}</a>` : `<span style="color:${MUTED};">${eWa}</span>`}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 0 0 0;border-top:1px solid ${BORDER};font-family:${BODY_FONT};font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">
        www.c4photosafaris.com
      </td>
    </tr>
  </table>
</td></tr>
</table>`;
}

/** Plain-text fallback for clipboard and older clients. */
export function buildPlainTextSignature(props: SignatureFormState): string {
  const name = props.fullName.trim() || "Your name";
  const title = props.jobTitle.trim() || "Your role";
  const lines = [
    "C4 Photo Safaris",
    "",
    name,
    title,
    "",
    props.phone.trim() ? `Phone: ${props.phone.trim()}` : "Phone: ",
    props.email.trim() ? `Email: ${props.email.trim()}` : "Email: ",
    props.whatsapp.trim() ? `WhatsApp: ${props.whatsapp.trim()}` : "WhatsApp: ",
    "",
    "www.c4photosafaris.com",
  ];
  return lines.join("\n");
}
