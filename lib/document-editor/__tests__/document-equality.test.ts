import { describe, expect, it } from "vitest";
import { documentsEqual } from "@/lib/document-editor/document-equality";
import type { SignatureDocument } from "@/types/signature-document";

const base: SignatureDocument = {
  version: 1,
  templateId: "corporate-classic",
  targetPlatform: "generic",
  canvasWidth: 500,
  blocks: [{ id: "b1", type: "text", content: "Hello", style: {} }],
  theme: {
    primaryColor: "#000",
    accentColor: "#111",
    textColor: "#222",
    mutedColor: "#333",
    borderColor: "#444",
  },
};

describe("documentsEqual", () => {
  it("returns true for identical references", () => {
    expect(documentsEqual(base, base)).toBe(true);
  });

  it("returns false when block content changes", () => {
    const other = {
      ...base,
      blocks: [{ ...base.blocks[0]!, content: "Changed", style: {} }],
    };
    expect(documentsEqual(base, other)).toBe(false);
  });
});
