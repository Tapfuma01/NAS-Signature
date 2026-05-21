import type { BlockStyle } from "@/types/block-style";
import type { SignatureBlock } from "@/types/signature-document";

const DEFAULT_SPACING: BlockStyle = {
  paddingTop: 0,
  paddingBottom: 8,
  marginBottom: 0,
};

export function newBlockId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type PaletteBlockType = SignatureBlock["type"];

export const PALETTE_BLOCKS: { type: PaletteBlockType; label: string; description: string }[] = [
  { type: "logo", label: "Logo", description: "Company logo image" },
  { type: "heading", label: "Heading", description: "Name, title, or company line" },
  { type: "contact_row", label: "Contact row", description: "Label + phone, email, or WhatsApp" },
  { type: "divider", label: "Divider", description: "Accent bar or line" },
  { type: "social", label: "Social links", description: "Row of social / web links" },
  { type: "footer_link", label: "Footer link", description: "Website footer" },
  { type: "spacer", label: "Spacer", description: "Vertical space" },
  { type: "banner", label: "Banner", description: "Promotional image strip" },
  { type: "disclaimer", label: "Disclaimer", description: "Legal / compliance text" },
];

export function createBlock(type: PaletteBlockType): SignatureBlock {
  const id = newBlockId();
  switch (type) {
    case "logo":
      return {
        id,
        type: "logo",
        src: "",
        width: 180,
        height: 48,
        align: "left",
        style: { ...DEFAULT_SPACING, paddingBottom: 12 },
      };
    case "heading":
      return {
        id,
        type: "heading",
        text: "Your name",
        level: "name",
        style: { paddingBottom: 4 },
      };
    case "contact_row":
      return {
        id,
        type: "contact_row",
        label: "Phone",
        valueField: "phone",
        style: { paddingBottom: 4 },
      };
    case "divider":
      return {
        id,
        type: "divider",
        variant: "accent",
        thickness: 3,
        width: "short",
        style: { paddingTop: 4, paddingBottom: 12 },
      };
    case "social":
      return {
        id,
        type: "social",
        items: [
          { network: "Website", url: "" },
          { network: "LinkedIn", url: "" },
        ],
      };
    case "footer_link":
      return { id, type: "footer_link", label: "www.example.com", url: "https://example.com" };
    case "spacer":
      return { id, type: "spacer", height: 10 };
    case "banner":
      return { id, type: "banner", src: "", href: "", width: 500, height: 80 };
    case "disclaimer":
      return {
        id,
        type: "disclaimer",
        text: "This message may contain confidential information.",
      };
    default:
      return { id, type: "spacer", height: 8 };
  }
}

export function blockTypeLabel(block: SignatureBlock): string {
  const match = PALETTE_BLOCKS.find((p) => p.type === block.type);
  if (block.type === "heading") {
    return `Heading (${block.level})`;
  }
  if (block.type === "contact_row") {
    return `Contact (${block.label})`;
  }
  return match?.label ?? block.type;
}
