import { applyBlockStyle, getBlockStyle, wrapRowWithBlockMargin } from "@/lib/signature-render/block-style";
import {
  resolveDividerThickness,
  resolveDividerWidth,
} from "@/lib/signature-render/divider-dimensions";
import { escapeHtml } from "@/lib/escape-html";
import type { RenderProfile } from "@/lib/signature-render/profiles/types";
import { toAbsoluteHttpsImageUrl } from "@/lib/signature-render/image-url";
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

/** Default label column color for Phone / Email / etc. (not theme accent). */
const CONTACT_LABEL_COLOR = "#000000";

function contactLabelColor(blockStyle: ReturnType<typeof getBlockStyle>): string {
  return blockStyle?.color ?? CONTACT_LABEL_COLOR;
}

function contactValueColor(
  blockStyle: ReturnType<typeof getBlockStyle>,
  theme: SignatureTheme,
): string {
  return blockStyle?.color ?? theme.textColor;
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
  if (block.customInputType === "tel") {
    return linkOrSpan(telHref(raw), trimmed || block.label, textColor);
  }
  if (block.customInputType === "email") {
    if (!trimmed) {
      return `<span style="color:${escapeHtml(mutedColor)};">${escapeHtml(block.label)}</span>`;
    }
    return `<a href="${escapeHtml(`mailto:${trimmed}`)}" style="color:${escapeHtml(textColor)};text-decoration:none;">${escapeHtml(trimmed)}</a>`;
  }
  if (block.customInputType === "url") {
    const href = /^https?:\/\//i.test(trimmed) ? trimmed : trimmed ? `https://${trimmed}` : "";
    return linkOrSpan(href || null, trimmed || block.label, textColor);
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

  const rawSrc = resolved.url || toAbsoluteHttpsImageUrl(block.src, assetsBaseUrl);
  const src = escapeHtml(rawSrc);
  const w = block.width || resolved.width;
  const h = block.height || resolved.height;
  const img = `<img src="${src}" width="${w}" height="${h}" alt="${logoAlt}" style="display:block;border:0;outline:none;text-decoration:none;max-width:${w}px;height:auto;">`;

  // Gmail loads images via a proxy; a nested presentation table improves reliability.
  if (ctx.profile.platform === "google_workspace") {
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr><td align="left" style="padding:0;line-height:0;font-size:0;">${img}</td></tr></table>`;
  }

  return img;
}

export function renderHeadingRow(
  block: Extract<SignatureBlock, { type: "heading" }>,
  ctx: StyleCompileContext,
): string {
  const { profile, theme, layout } = ctx;
  const safe = escapeHtml(block.text);
  const strict = profile.strictOutlook;

  const blockStyle = getBlockStyle(block);
  const textColor = blockStyle?.color ?? (block.level === "company" ? theme.accentColor : block.level === "name" ? theme.textColor : theme.mutedColor);

  if (block.level === "company") {
    const transform = layout.companyUppercase ? "text-transform:uppercase;" : "";
    const style = applyBlockStyle(
      msoCell(
        `padding:0 0 8px 0;font-family:${profile.headingFont};font-size:${layout.companyFontSize};font-weight:700;letter-spacing:${layout.companyLetterSpacing};${transform}color:${escapeHtml(textColor)};line-height:1.35`,
        strict,
      ),
      blockStyle,
    );
    return wrapRowWithBlockMargin(`<tr><td style="${style}">${safe}</td></tr>`, blockStyle);
  }
  if (block.level === "name") {
    const style = applyBlockStyle(
      msoCell(
        `padding:0 0 ${layout.namePaddingBottom} 0;font-family:${profile.headingFont};font-size:${layout.nameFontSize};font-weight:700;color:${escapeHtml(textColor)};line-height:1.25`,
        strict,
      ),
      blockStyle,
    );
    return wrapRowWithBlockMargin(`<tr><td style="${style}">${safe}</td></tr>`, blockStyle);
  }
  const style = applyBlockStyle(
    msoCell(
      `padding:0 0 ${layout.titlePaddingBottom} 0;font-family:${profile.bodyFont};font-size:${layout.titleFontSize};color:${escapeHtml(textColor)};line-height:1.4`,
      strict,
    ),
    blockStyle,
  );
  return wrapRowWithBlockMargin(`<tr><td style="${style}">${safe}</td></tr>`, blockStyle);
}

export function renderDividerRow(
  block: Extract<SignatureBlock, { type: "divider" }>,
  ctx: StyleCompileContext,
): string {
  const { theme, layout, canvasWidth } = ctx;
  const variant = block.variant ?? "line";
  const blockStyle = getBlockStyle(block);
  const thickness = resolveDividerThickness(block);
  const { widthAttr, widthStyle } = resolveDividerWidth(block, layout, canvasWidth);
  const fillColor =
    variant === "accent"
      ? block.color ?? blockStyle?.color ?? theme.primaryColor
      : block.color ?? blockStyle?.borderColor ?? theme.borderColor;
  const safeFill = escapeHtml(fillColor);
  const cellStyle = applyBlockStyle(
    variant === "accent" ? "padding:0 0 16px 0;" : "padding:8px 0 12px 0;",
    blockStyle,
  );

  const barRow = `<tr><td height="${thickness}" bgcolor="${safeFill}" style="font-size:0;line-height:0;height:${thickness}px;background-color:${safeFill};">&nbsp;</td></tr>`;

  const inner = `<tr>
      <td style="${cellStyle}">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${widthAttr}" style="width:${widthStyle};max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
          ${barRow}
        </table>
      </td>
    </tr>`;
  return wrapRowWithBlockMargin(inner, blockStyle);
}

function renderSingleContactRow(
  block: Extract<SignatureBlock, { type: "contact_row" }>,
  ctx: StyleCompileContext,
): string {
  const { profile, theme, fields, layout } = ctx;
  const blockStyle = getBlockStyle(block);
  const valueColor = contactValueColor(blockStyle, theme);
  const labelColor = contactLabelColor(blockStyle);
  const safeValue = escapeHtml(valueColor);
  const safeLabel = escapeHtml(labelColor);
  const val = contactValueHtml(block, fields, valueColor, theme.mutedColor);

  if (layout.contactMode === "inline") {
    const cellStyle = applyBlockStyle(
      `padding:0 0 12px 0;font-family:${profile.bodyFont};font-size:12px;line-height:1.5;color:${safeValue};`,
      blockStyle,
    );
    const inner = `<tr><td style="${cellStyle}">${val}</td></tr>`;
    return wrapRowWithBlockMargin(inner, blockStyle);
  }

  if (layout.contactMode === "stacked") {
    const labelStyle = applyBlockStyle(
      `padding:0 0 6px 0;font-family:${profile.bodyFont};font-size:10px;font-weight:700;color:${safeLabel};`,
      blockStyle,
    );
    const valueStyle = applyBlockStyle(
      `padding:0 0 8px 0;font-family:${profile.bodyFont};font-size:13px;color:${safeValue};`,
      blockStyle,
    );
    const inner = `<tr><td style="padding:0 0 4px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
      <tr><td style="${labelStyle}">${escapeHtml(block.label)}</td></tr>
      <tr><td style="${valueStyle}">${val}</td></tr>
    </table></td></tr>`;
    return wrapRowWithBlockMargin(inner, blockStyle);
  }

  const labelW = profile.contactLabelWidth;
  const labelStyle = applyBlockStyle(
    `padding:0 10px 6px 0;font-family:${profile.bodyFont};font-size:11px;font-weight:700;color:${safeLabel};vertical-align:top;`,
    blockStyle,
  );
  const valueStyle = applyBlockStyle(
    `padding:0 0 6px 0;font-family:${profile.bodyFont};font-size:13px;color:${safeValue};vertical-align:top;`,
    blockStyle,
  );
  const inner = `<tr><td style="padding:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
    <tr>
      <td width="${labelW}" style="${labelStyle}">${escapeHtml(block.label)}</td>
      <td style="${valueStyle}">${val}</td>
    </tr>
  </table></td></tr>`;
  return wrapRowWithBlockMargin(inner, blockStyle);
}

/** Renders one or more contact rows; each block gets its own style overrides. */
export function renderContactRowsHtml(
  blocks: Extract<SignatureBlock, { type: "contact_row" }>[],
  ctx: StyleCompileContext,
): string {
  if (blocks.length === 0) return "";

  const { profile, theme, fields, layout } = ctx;

  if (layout.contactMode === "inline" && blocks.length > 1) {
    const parts = blocks
      .map((block, i) => {
        const blockStyle = getBlockStyle(block);
        const valueColor = blockStyle?.color ?? theme.textColor;
        const val = contactValueHtml(block, fields, valueColor, theme.mutedColor);
        const spanStyle = applyBlockStyle(
          `font-family:${profile.bodyFont};font-size:12px;color:${escapeHtml(valueColor)};`,
          blockStyle,
        );
        const segment = `<span style="${spanStyle}">${val}</span>`;
        if (i === 0) return segment;
        return `<span style="font-family:${profile.bodyFont};font-size:12px;color:${escapeHtml(theme.mutedColor)};padding:0 6px;">&nbsp;·&nbsp;</span>${segment}`;
      })
      .join("");
    const batchStyle = applyBlockStyle(
      `padding:0 0 12px 0;font-family:${profile.bodyFont};font-size:12px;line-height:1.5;`,
      getBlockStyle(blocks[0]),
    );
    const inner = `<tr><td style="${batchStyle}">${parts}</td></tr>`;
    return wrapRowWithBlockMargin(inner, getBlockStyle(blocks[0]));
  }

  return blocks.map((block) => renderSingleContactRow(block, ctx)).join("");
}

export function renderLogoRow(
  block: Extract<SignatureBlock, { type: "logo" }>,
  ctx: StyleCompileContext,
): string {
  const blockStyle = getBlockStyle(block);
  const cellStyle = applyBlockStyle("padding:0 0 10px 0;vertical-align:top;", blockStyle);
  const inner = `<tr><td style="${cellStyle}">${renderLogoHtml(block, ctx)}</td></tr>`;
  return wrapRowWithBlockMargin(inner, blockStyle);
}

export function renderFooterRow(
  block: Extract<SignatureBlock, { type: "footer_link" }>,
  ctx: StyleCompileContext,
): string {
  const { profile, theme, layout } = ctx;
  const blockStyle = getBlockStyle(block);
  const linkColor = escapeHtml(blockStyle?.color ?? theme.mutedColor);
  const isC4 = layout.footerMode === "c4-uppercase";
  const typography = isC4
    ? `font-family:${profile.bodyFont};font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${linkColor};`
    : `font-family:${profile.bodyFont};font-size:11px;color:${linkColor};`;
  const background = blockStyle?.backgroundColor
    ? `background-color:${escapeHtml(blockStyle.backgroundColor)};`
    : "";
  const cellStyle = applyBlockStyle(
    `${isC4 ? "padding:14px 0 0 0;" : "padding:12px 0 0 0;"}${typography}${background}`,
    blockStyle,
  );
  const linkStyle = `color:${linkColor};text-decoration:none;`;

  const displayText = (raw: string) =>
    raw
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, "")
      .replace(/\/$/, "");

  const urls = (block.urls && block.urls.length > 0 ? block.urls : [block.label || block.url])
    .map((v) => (v ?? "").trim())
    .filter(Boolean)
    .slice(0, 3);

  const separator = `<span style="color:${escapeHtml(theme.mutedColor)};padding:0 8px;">|</span>`;
  const linksHtml =
    urls.length > 0
      ? urls
          .map((raw) => {
            const href = escapeHtml(raw);
            const display = escapeHtml(displayText(raw));
            return `<a href="${href}" style="${linkStyle}">${display}</a>`;
          })
          .join(separator)
      : "";

  const inner = `<tr><td style="${cellStyle}">
        ${linksHtml}
      </td></tr>`;
  return wrapRowWithBlockMargin(inner, blockStyle);
}

export function renderSocialRow(
  block: Extract<SignatureBlock, { type: "social" }>,
  ctx: StyleCompileContext,
): string {
  const { profile, theme, layout } = ctx;
  const blockStyle = getBlockStyle(block);
  const items = block.items.filter((item) => item.network.trim());
  if (items.length === 0) return "";

  const pillBg = escapeHtml(blockStyle?.backgroundColor ?? blockStyle?.color ?? theme.accentColor);
  const linkColor = escapeHtml(blockStyle?.color ?? theme.accentColor);

  if (layout.socialMode === "pills") {
    const cells = items
      .map((item) => {
        const url = item.url.trim() || "#";
        const label = escapeHtml(item.network);
        return `<td style="padding:0 6px 0 0;vertical-align:top;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr><td bgcolor="${pillBg}" style="background-color:${pillBg};padding:4px 10px;font-family:${profile.bodyFont};font-size:11px;font-weight:600;">
              <a href="${escapeHtml(url)}" style="color:#ffffff;text-decoration:none;">${label}</a>
            </td></tr>
          </table>
        </td>`;
      })
      .join("");
    const cellStyle = applyBlockStyle("padding:8px 0 4px 0;", blockStyle);
    const inner = `<tr><td style="${cellStyle}"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table></td></tr>`;
    return wrapRowWithBlockMargin(inner, blockStyle);
  }

  const links = items
    .map((item) => {
      const url = item.url.trim();
      return `<a href="${escapeHtml(url || "#")}" style="color:${linkColor};text-decoration:none;font-family:${profile.bodyFont};font-size:12px;margin-right:10px;">${escapeHtml(item.network)}</a>`;
    })
    .join("");
  const cellStyle = applyBlockStyle("padding:6px 0 0 0;", blockStyle);
  const inner = `<tr><td style="${cellStyle}">${links}</td></tr>`;
  return wrapRowWithBlockMargin(inner, blockStyle);
}

export function renderDisclaimerRow(
  block: Extract<SignatureBlock, { type: "disclaimer" }>,
  ctx: StyleCompileContext,
): string {
  const { profile, theme, layout } = ctx;
  const blockStyle = getBlockStyle(block);
  const safe = escapeHtml(block.text);
  const textColor = escapeHtml(blockStyle?.color ?? theme.mutedColor);
  const borderColor = escapeHtml(blockStyle?.borderColor ?? theme.borderColor);
  const background = blockStyle?.backgroundColor
    ? `background-color:${escapeHtml(blockStyle.backgroundColor)};`
    : "";
  const base = applyBlockStyle(
    `font-family:${profile.bodyFont};font-size:10px;color:${textColor};line-height:1.45;${background}`,
    blockStyle,
  );

  if (layout.disclaimerBordered) {
    const outerStyle = applyBlockStyle("padding:10px 0 0 0;", blockStyle);
    const inner = `<tr><td style="${outerStyle}">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;border:1px solid ${borderColor};">
        <tr><td style="padding:8px 10px;${base}">${safe}</td></tr>
      </table>
    </td></tr>`;
    return wrapRowWithBlockMargin(inner, blockStyle);
  }

  const cellStyle = applyBlockStyle(`padding:10px 0 0 0;${base}`, blockStyle);
  const inner = `<tr><td style="${cellStyle}">${safe}</td></tr>`;
  return wrapRowWithBlockMargin(inner, blockStyle);
}

export function renderSpacerRow(block: Extract<SignatureBlock, { type: "spacer" }>): string {
  const blockStyle = getBlockStyle(block);
  const extraTop = blockStyle?.paddingTop ?? 0;
  const extraBottom = blockStyle?.paddingBottom ?? 0;
  const h = Math.max(0, Math.min(block.height + extraTop + extraBottom, 64));
  const cellStyle = applyBlockStyle(`font-size:0;line-height:0;height:${h}px;`, blockStyle);
  const inner = `<tr><td height="${h}" style="${cellStyle}">&nbsp;</td></tr>`;
  return wrapRowWithBlockMargin(inner, blockStyle);
}

export function renderBannerRow(
  block: Extract<SignatureBlock, { type: "banner" }>,
  ctx: StyleCompileContext,
): string {
  const blockStyle = getBlockStyle(block);
  const w = block.width ?? 500;
  const h = block.height ?? 80;
  const src = escapeHtml(toAbsoluteHttpsImageUrl(block.src, ctx.assetsBaseUrl));
  const border = blockStyle?.borderColor
    ? `border:1px solid ${escapeHtml(blockStyle.borderColor)};`
    : "";
  const img = `<img src="${src}" width="${w}" height="${h}" alt="" style="display:block;border:0;outline:none;max-width:${w}px;height:auto;${border}">`;
  const innerContent = block.href
    ? `<a href="${escapeHtml(block.href)}" style="text-decoration:none;">${img}</a>`
    : img;
  const cellStyle = applyBlockStyle("padding:10px 0 0 0;", blockStyle);
  const inner = `<tr><td style="${cellStyle}">${innerContent}</td></tr>`;
  return wrapRowWithBlockMargin(inner, blockStyle);
}
