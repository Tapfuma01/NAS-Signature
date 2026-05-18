import {
  renderContactRowsHtml,
  renderFooterRow,
  renderHeadingRow,
  renderLogoHtml,
  renderSocialRow,
  type StyleCompileContext,
} from "@/lib/signature-render/layout-styles/primitives";
import type { SignatureBlock } from "@/types/signature-document";

function renderRightColumn(blocks: SignatureBlock[], ctx: StyleCompileContext): string {
  const rows: string[] = [];
  let contactBatch: Extract<SignatureBlock, { type: "contact_row" }>[] = [];

  const flushContacts = () => {
    if (contactBatch.length === 0) return;
    rows.push(renderContactRowsHtml(contactBatch, ctx));
    contactBatch = [];
  };

  for (const block of blocks) {
    switch (block.type) {
      case "heading":
        flushContacts();
        rows.push(renderHeadingRow(block, ctx));
        break;
      case "contact_row":
        contactBatch.push(block);
        break;
      case "social":
        flushContacts();
        rows.push(renderSocialRow(block, ctx));
        break;
      case "footer_link":
        flushContacts();
        rows.push(renderFooterRow(block, ctx));
        break;
      default:
        break;
    }
  }
  flushContacts();

  return rows.join("");
}

/** Logo left, identity + contacts + social + footer right. */
export function compileSidebarLayout(blocks: SignatureBlock[], ctx: StyleCompileContext): string {
  const logoBlock = blocks.find((b): b is Extract<SignatureBlock, { type: "logo" }> => b.type === "logo");
  const rightBlocks = blocks.filter(
    (b) => b.type !== "logo" && b.type !== "divider" && b.type !== "spacer" && b.type !== "banner",
  );

  const logoHtml = logoBlock ? renderLogoHtml(logoBlock, ctx) : "";
  const rightHtml = renderRightColumn(rightBlocks, ctx);

  const logoCell = logoBlock
    ? `<td width="130" valign="top" style="padding:0 16px 0 0;vertical-align:top;">${logoHtml}</td>`
    : "";

  return `<tr>
    <td style="padding:0 0 12px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
        <tr>
          ${logoCell}
          <td valign="top" style="vertical-align:top;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
              ${rightHtml}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}
