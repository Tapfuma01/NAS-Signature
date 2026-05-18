import type { SignatureDocument, SignatureFieldValues } from "@/types/signature-document";

/** Plain-text fallback derived from document blocks and field values. */
export function buildPlainTextFromDocument(
  document: SignatureDocument,
  fields: SignatureFieldValues,
): string {
  const lines: string[] = [];

  for (const block of document.blocks) {
    switch (block.type) {
      case "heading":
        if (block.level === "company") {
          lines.push(block.text.trim() || fields.companyName.trim() || "Company");
          lines.push("");
        } else if (block.level === "name") {
          lines.push(block.text.trim() || fields.fullName.trim() || "Your name");
        } else {
          lines.push(block.text.trim() || fields.jobTitle.trim() || "Your role");
        }
        break;
      case "contact_row": {
        const raw =
          block.valueField === "custom"
            ? (block.customValue ?? "")
            : (fields[block.valueField] ?? "");
        const val = raw.trim();
        if (block.valueField === "phone") lines.push(val ? `Phone: ${val}` : "Phone: ");
        else if (block.valueField === "email") lines.push(val ? `Email: ${val}` : "Email: ");
        else if (block.valueField === "whatsapp") lines.push(val ? `WhatsApp: ${val}` : "WhatsApp: ");
        else if (val) lines.push(`${block.label}: ${val}`);
        break;
      }
      case "footer_link":
        lines.push(block.label.trim() || block.url);
        break;
      case "disclaimer":
        if (block.text.trim()) lines.push(block.text.trim());
        break;
      default:
        break;
    }
  }

  return lines.join("\n");
}
