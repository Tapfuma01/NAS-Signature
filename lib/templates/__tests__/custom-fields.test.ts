import { describe, expect, it } from "vitest";
import { getMemberCustomFieldDefs } from "@/lib/templates/custom-fields";
import type { SignatureBlock } from "@/types/signature-document";

describe("getMemberCustomFieldDefs", () => {
  it("returns only custom contact blocks with defaults", () => {
    const blocks: SignatureBlock[] = [
      { id: "name", type: "heading", level: "name", text: "Name" },
      { id: "phone", type: "contact_row", label: "Phone", valueField: "phone" },
      {
        id: "mobile",
        type: "contact_row",
        label: "Mobile",
        valueField: "custom",
        customInputType: "tel",
        customValue: "Optional",
      },
    ];
    expect(getMemberCustomFieldDefs(blocks)).toEqual([
      {
        blockId: "mobile",
        label: "Mobile",
        inputType: "tel",
        placeholder: "Optional",
      },
    ]);
  });

  it("dedupes duplicate custom block ids", () => {
    const blocks: SignatureBlock[] = [
      { id: "alt", type: "contact_row", label: "Alt", valueField: "custom" },
      { id: "alt", type: "contact_row", label: "Alt 2", valueField: "custom", customInputType: "email" },
    ];
    expect(getMemberCustomFieldDefs(blocks)).toHaveLength(1);
    expect(getMemberCustomFieldDefs(blocks)[0]?.inputType).toBe("text");
  });
});
