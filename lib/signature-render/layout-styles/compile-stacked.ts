import {
  renderBannerRow,
  renderContactRowsHtml,
  renderDisclaimerRow,
  renderDividerRow,
  renderFooterRow,
  renderHeadingRow,
  renderLogoRow,
  renderSocialRow,
  renderSpacerRow,
  type StyleCompileContext,
} from "@/lib/signature-render/layout-styles/primitives";
import type { SignatureBlock } from "@/types/signature-document";

export function compileStackedLayout(blocks: SignatureBlock[], ctx: StyleCompileContext): string {
  const rows: string[] = [];
  let contactBatch: Extract<SignatureBlock, { type: "contact_row" }>[] = [];

  const flushContacts = () => {
    if (contactBatch.length === 0) return;
    rows.push(renderContactRowsHtml(contactBatch, ctx));
    contactBatch = [];
  };

  for (const block of blocks) {
    switch (block.type) {
      case "logo":
        flushContacts();
        rows.push(renderLogoRow(block, ctx));
        break;
      case "heading":
        flushContacts();
        rows.push(renderHeadingRow(block, ctx));
        break;
      case "divider":
        flushContacts();
        rows.push(renderDividerRow(block, ctx));
        break;
      case "contact_row":
        contactBatch.push(block);
        break;
      case "footer_link":
        flushContacts();
        rows.push(renderFooterRow(block, ctx));
        break;
      case "spacer":
        flushContacts();
        rows.push(renderSpacerRow(block));
        break;
      case "banner":
        flushContacts();
        rows.push(renderBannerRow(block, ctx));
        break;
      case "social":
        flushContacts();
        rows.push(renderSocialRow(block, ctx));
        break;
      case "disclaimer":
        flushContacts();
        rows.push(renderDisclaimerRow(block, ctx));
        break;
      default:
        break;
    }
  }
  flushContacts();
  return rows.join("");
}
