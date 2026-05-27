import type { SignatureBlock } from "@/types/signature-document";

export type MemberCustomFieldDef = {
  blockId: string;
  label: string;
  inputType: "text" | "tel" | "email" | "url";
  placeholder?: string;
};

export function getMemberCustomFieldDefs(blocks: SignatureBlock[]): MemberCustomFieldDef[] {
  const seen = new Set<string>();
  const defs: MemberCustomFieldDef[] = [];
  for (const block of blocks) {
    if (block.type !== "contact_row" || block.valueField !== "custom" || seen.has(block.id)) {
      continue;
    }
    seen.add(block.id);
    defs.push({
      blockId: block.id,
      label: block.label.trim() || "Additional field",
      inputType: block.customInputType ?? "text",
      placeholder: block.customValue?.trim() || undefined,
    });
  }
  return defs;
}
