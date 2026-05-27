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
        if (block.urls && block.urls.length > 0) {
          const joined = block.urls
            .map((v) => (v ?? "").trim())
            .filter(Boolean)
            .slice(0, 3)
            .map((v) =>
              v
                .toLowerCase()
                .replace(/^https?:\/\//i, "")
                .replace(/\/$/, ""),
            )
            .join(" | ");
          if (joined) lines.push(joined);
        } else {
          const single = (block.label.trim() || block.url)
            .toLowerCase()
            .replace(/^https?:\/\//i, "")
            .replace(/\/$/, "");
          if (single) lines.push(single);
        }
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
