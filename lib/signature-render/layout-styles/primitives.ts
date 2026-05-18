import { escapeHtml } from "@/lib/escape-html";
import type { RenderProfile } from "@/lib/signature-render/profiles/types";
import { linkOrSpan, resolveLogoUrl, telHref, whatsappHref } from "@/lib/signature-render/utils";
import type { LayoutStyleConfig } from "@/lib/signature-render/layout-styles/config";
import type { SignatureBlock, SignatureFieldValues, SignatureTheme } from "@/types/signature-document";

export type StyleCompileContext = {
  profile: RenderProfile;
  theme: SignatureTheme;
  fields: SignatureFieldValues;
  assetsBaseUrl: string;
  orgLogoUrl: string;
  canvasWidth: number;
  layout: LayoutStyleConfig;
};

function msoCell(extra: string, strict: boolean): string {
  return strict ? `${extra};mso-line-height-rule:exactly` : extra;
}

export function contactValueHtml(
  block: Extract<SignatureBlock, { type: "contact_row" }>,
  fields: SignatureFieldValues,
  textColor: string,
  mutedColor: string,
): string {
  const raw =
    block.valueField === "custom" ? (block.customValue ?? "") : (fields[block.valueField] ?? "");
  const trimmed = raw.trim();

  if (block.valueField === "phone") {
    return linkOrSpan(telHref(raw), trimmed || "Phone number", textColor);
  }
  if (block.valueField === "email") {
    if (!trimmed) {
      return `<span style="color:${escapeHtml(mutedColor)};">${escapeHtml("Email address")}</span>`;
    }
    return `<a href="${escapeHtml(`mailto:${trimmed}`)}" style="color:${escapeHtml(textColor)};text-decoration:none;">${escapeHtml(trimmed)}</a>`;
  }
  if (block.valueField === "whatsapp") {
    const href = whatsappHref(raw);
    const label = trimmed || "WhatsApp";
    if (href) {
      return `<a href="${escapeHtml(href)}" style="color:${escapeHtml(textColor)};text-decoration:none;">${escapeHtml(label)}</a>`;
    }
    return `<span style="color:${escapeHtml(mutedColor)};">${escapeHtml(label)}</span>`;
  }
  return escapeHtml(trimmed || block.label);
}

export function renderLogoHtml(
  block: Extract<SignatureBlock, { type: "logo" }>,
  ctx: StyleCompileContext,
): string {
  const { theme, fields, assetsBaseUrl, orgLogoUrl } = ctx;
  const resolved = resolveLogoUrl(assetsBaseUrl, orgLogoUrl, block.src);
  const safeBorder = escapeHtml(theme.borderColor);
  const safeMuted = escapeHtml(theme.mutedColor);
  const logoAlt = escapeHtml(fields.companyName.trim() || "Company logo");

  if (resolved.isPlaceholder && !block.src) {
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="120" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;border:1px dashed ${safeBorder};"><tr><td align="center" valign="middle" height="44" style="font-family:${ctx.profile.bodyFont};font-size:10px;color:${safeMuted};padding:6px;">Logo</td></tr></table>`;
  }

  const src = escapeHtml(resolved.url || block.src);
  const w = block.width || resolved.width;
  const h = block.height || resolved.height;
  return `<img src="${src}" width="${w}" height="${h}" alt="${logoAlt}" style="display:block;border:0;outline:none;text-decoration:none;max-width:${w}px;height:auto;">`;
}

export function renderHeadingRow(
  block: Extract<SignatureBlock, { type: "heading" }>,
  ctx: StyleCompileContext,
): string {
  const { profile, theme, layout } = ctx;
  const safe = escapeHtml(block.text);
  const strict = profile.strictOutlook;

  if (block.level === "company") {
    const transform = layout.companyUppercase ? "text-transform:uppercase;" : "";
    const style = msoCell(
      `padding:0 0 6px 0;font-family:${profile.headingFont};font-size:${layout.companyFontSize};font-weight:700;letter-spacing:${layout.companyLetterSpacing};${transform}color:${escapeHtml(theme.accentColor)};line-height:1.35`,
      strict,
    );
    return `<tr><td style="${style}">${safe}</td></tr>`;
  }
  if (block.level === "name") {
    const style = msoCell(
      `padding:0 0 ${layout.namePaddingBottom} 0;font-family:${profile.headingFont};font-size:${layout.nameFontSize};font-weight:700;color:${escapeHtml(theme.textColor)};line-height:1.25`,
      strict,
    );
    return `<tr><td style="${style}">${safe}</td></tr>`;
  }
  const style = msoCell(
    `padding:0 0 ${layout.titlePaddingBottom} 0;font-family:${profile.bodyFont};font-size:${layout.titleFontSize};color:${escapeHtml(theme.mutedColor)};line-height:1.4`,
    strict,
  );
  return `<tr><td style="${style}">${safe}</td></tr>`;
}

export function renderDividerRow(
  block: Extract<SignatureBlock, { type: "divider" }>,
  ctx: StyleCompileContext,
): string {
  const { theme, layout, canvasWidth } = ctx;
  const variant = block.variant ?? "line";

  if (variant === "accent") {
    const safePrimary = escapeHtml(theme.primaryColor);
    const barWidth = layout.dividerAccentWidth === "full" ? "100%" : "80";
    return `<tr>
      <td style="padding:0 0 14px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${barWidth}" style="width:${layout.dividerAccentWidth === "full" ? `${canvasWidth}px` : "80px"};max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
          <tr><td height="3" bgcolor="${safePrimary}" style="font-size:0;line-height:0;height:3px;background-color:${safePrimary};">&nbsp;</td></tr>
        </table>
      </td>
    </tr>`;
  }

  const safeBorder = escapeHtml(theme.borderColor);
  return `<tr><td style="padding:6px 0 10px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tr><td height="1" bgcolor="${safeBorder}" style="font-size:0;line-height:0;background-color:${safeBorder};">&nbsp;</td></tr></table></td></tr>`;
}

export function renderContactRowsHtml(
  blocks: Extract<SignatureBlock, { type: "contact_row" }>[],
  ctx: StyleCompileContext,
): string {
  if (blocks.length === 0) return "";

  const { profile, theme, fields, layout } = ctx;
  const safeAccent = escapeHtml(theme.accentColor);
  const safeText = escapeHtml(theme.textColor);
  const safeMuted = escapeHtml(theme.mutedColor);

  if (layout.contactMode === "inline") {
    const parts = blocks
      .map((block) => {
        const val = contactValueHtml(block, fields, theme.textColor, theme.mutedColor);
        return `<span style="font-family:${profile.bodyFont};font-size:12px;color:${safeText};">${val}</span>`;
      })
      .join(
        `<span style="font-family:${profile.bodyFont};font-size:12px;color:${safeMuted};padding:0 6px;">&nbsp;·&nbsp;</span>`,
      );
    return `<tr><td style="padding:0 0 12px 0;font-family:${profile.bodyFont};font-size:12px;line-height:1.5;">${parts}</td></tr>`;
  }

  if (layout.contactMode === "stacked") {
    const rows = blocks
      .map((block) => {
        const val = contactValueHtml(block, fields, theme.textColor, theme.mutedColor);
        return `<tr>
          <td style="padding:0 0 6px 0;font-family:${profile.bodyFont};font-size:10px;color:${safeMuted};">${escapeHtml(block.label)}</td>
        </tr>
        <tr>
          <td style="padding:0 0 8px 0;font-family:${profile.bodyFont};font-size:13px;color:${safeText};">${val}</td>
        </tr>`;
      })
      .join("");
    return `<tr><td style="padding:0 0 4px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">${rows}</table></td></tr>`;
  }

  const labelW = profile.contactLabelWidth;
  const rows = blocks
    .map((block, i) => {
      const isLast = i === blocks.length - 1;
      const labelPad = isLast ? "0 10px 0 0" : "0 10px 6px 0";
      const valuePad = isLast ? "0" : "0 0 6px 0";
      return `<tr>
            <td width="${labelW}" style="padding:${labelPad};font-family:${profile.bodyFont};font-size:11px;font-weight:700;color:${safeAccent};vertical-align:top;">${escapeHtml(block.label)}</td>
            <td style="padding:${valuePad};font-family:${profile.bodyFont};font-size:13px;color:${safeText};vertical-align:top;">
              ${contactValueHtml(block, fields, theme.textColor, theme.mutedColor)}
            </td>
          </tr>`;
    })
    .join("");

  return `<tr><td style="padding:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">${rows}</table></td></tr>`;
}

export function renderFooterRow(
  block: Extract<SignatureBlock, { type: "footer_link" }>,
  ctx: StyleCompileContext,
): string {
  const { profile, theme, layout } = ctx;
  const safeFooterHref = escapeHtml(block.url);
  const safeFooterLabel = escapeHtml(block.label.trim() || block.url);
  const safeMuted = escapeHtml(theme.mutedColor);
  const isC4 = layout.footerMode === "c4-uppercase";
  const cellStyle = isC4
    ? `padding:14px 0 0 0;font-family:${profile.bodyFont};font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${safeMuted};`
    : `padding:12px 0 0 0;font-family:${profile.bodyFont};font-size:11px;color:${safeMuted};`;

  if (profile.footerSeparator === "table-row") {
    const safeBorder = escapeHtml(theme.borderColor);
    return `<tr>
      <td style="padding:14px 0 0 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
          <tr><td height="1" bgcolor="${safeBorder}" style="font-size:0;line-height:0;background-color:${safeBorder};">&nbsp;</td></tr>
          <tr><td style="${cellStyle}">
            <a href="${safeFooterHref}" style="color:${safeMuted};text-decoration:none;">${safeFooterLabel}</a>
          </td></tr>
        </table>
      </td>
    </tr>`;
  }

  return `<tr><td style="${cellStyle}border-top:1px solid ${escapeHtml(theme.borderColor)};">
        <a href="${safeFooterHref}" style="color:${safeMuted};text-decoration:none;">${safeFooterLabel}</a>
      </td></tr>`;
}

export function renderSocialRow(
  block: Extract<SignatureBlock, { type: "social" }>,
  ctx: StyleCompileContext,
): string {
  const { profile, theme, layout } = ctx;
  const items = block.items.filter((item) => item.network.trim());
  if (items.length === 0) return "";

  if (layout.socialMode === "pills") {
    const safeAccent = escapeHtml(theme.accentColor);
    const cells = items
      .map((item) => {
        const url = item.url.trim() || "#";
        const label = escapeHtml(item.network);
        return `<td style="padding:0 6px 0 0;vertical-align:top;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr><td bgcolor="${safeAccent}" style="background-color:${safeAccent};padding:4px 10px;font-family:${profile.bodyFont};font-size:11px;font-weight:600;">
              <a href="${escapeHtml(url)}" style="color:#ffffff;text-decoration:none;">${label}</a>
            </td></tr>
          </table>
        </td>`;
      })
      .join("");
    return `<tr><td style="padding:8px 0 4px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table></td></tr>`;
  }

  const links = items
    .map((item) => {
      const url = item.url.trim();
      return `<a href="${escapeHtml(url || "#")}" style="color:${escapeHtml(theme.accentColor)};text-decoration:none;font-family:${profile.bodyFont};font-size:12px;margin-right:10px;">${escapeHtml(item.network)}</a>`;
    })
    .join("");
  return `<tr><td style="padding:6px 0 0 0;">${links}</td></tr>`;
}

export function renderDisclaimerRow(
  block: Extract<SignatureBlock, { type: "disclaimer" }>,
  ctx: StyleCompileContext,
): string {
  const { profile, theme, layout } = ctx;
  const safe = escapeHtml(block.text);
  const base = `font-family:${profile.bodyFont};font-size:10px;color:${escapeHtml(theme.mutedColor)};line-height:1.45;`;

  if (layout.disclaimerBordered) {
    const safeBorder = escapeHtml(theme.borderColor);
    return `<tr><td style="padding:10px 0 0 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;border:1px solid ${safeBorder};">
        <tr><td style="padding:8px 10px;${base}">${safe}</td></tr>
      </table>
    </td></tr>`;
  }

  return `<tr><td style="padding:10px 0 0 0;${base}">${safe}</td></tr>`;
}

export function renderSpacerRow(block: Extract<SignatureBlock, { type: "spacer" }>): string {
  const h = Math.max(0, Math.min(block.height, 48));
  return `<tr><td height="${h}" style="font-size:0;line-height:0;height:${h}px;">&nbsp;</td></tr>`;
}

export function renderBannerRow(block: Extract<SignatureBlock, { type: "banner" }>): string {
  const w = block.width ?? 500;
  const h = block.height ?? 80;
  const src = escapeHtml(block.src);
  const img = `<img src="${src}" width="${w}" height="${h}" alt="" style="display:block;border:0;max-width:${w}px;height:auto;">`;
  const inner = block.href
    ? `<a href="${escapeHtml(block.href)}" style="text-decoration:none;">${img}</a>`
    : img;
  return `<tr><td style="padding:10px 0 0 0;">${inner}</td></tr>`;
}
