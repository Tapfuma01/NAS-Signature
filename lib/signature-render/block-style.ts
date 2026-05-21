import type { BlockStyle } from "@/types/block-style";
import type { SignatureBlock } from "@/types/signature-document";

export function getBlockStyle(block: SignatureBlock): BlockStyle | undefined {
  return "style" in block ? block.style : undefined;
}

/** Merge block style into a base inline CSS string for table cells. */
export function applyBlockStyle(base: string, style?: BlockStyle): string {
  if (!style) return base;
  const parts = [base];
  const pad = [
    style.paddingTop != null ? `padding-top:${style.paddingTop}px` : null,
    style.paddingRight != null ? `padding-right:${style.paddingRight}px` : null,
    style.paddingBottom != null ? `padding-bottom:${style.paddingBottom}px` : null,
    style.paddingLeft != null ? `padding-left:${style.paddingLeft}px` : null,
  ].filter(Boolean);
  const margin = [
    style.marginTop != null ? `margin-top:${style.marginTop}px` : null,
    style.marginRight != null ? `margin-right:${style.marginRight}px` : null,
    style.marginBottom != null ? `margin-bottom:${style.marginBottom}px` : null,
    style.marginLeft != null ? `margin-left:${style.marginLeft}px` : null,
  ].filter(Boolean);
  if (pad.length) parts.push(pad.join(";"));
  if (margin.length) parts.push(margin.join(";"));
  if (style.color) parts.push(`color:${style.color}`);
  if (style.backgroundColor) parts.push(`background-color:${style.backgroundColor}`);
  if (style.borderColor) parts.push(`border-color:${style.borderColor}`);
  return parts.join(";");
}

/** Wrap rendered row HTML with outer margin from block style. */
export function wrapRowWithBlockMargin(innerRowHtml: string, style?: BlockStyle): string {
  if (!style?.marginTop && !style?.marginBottom && !style?.marginLeft && !style?.marginRight) {
    return innerRowHtml;
  }
  const outer = applyBlockStyle("font-size:0;line-height:0;", {
    marginTop: style.marginTop,
    marginBottom: style.marginBottom,
    marginLeft: style.marginLeft,
    marginRight: style.marginRight,
  });
  return `<tr><td style="${outer}"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tbody>${innerRowHtml}</tbody></table></td></tr>`;
}
