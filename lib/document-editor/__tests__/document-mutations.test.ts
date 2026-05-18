import { describe, expect, it } from "vitest";
import { createBlock } from "@/lib/document-editor/block-factory";
import {
  insertBlock,
  removeBlock,
  reorderBlocks,
  updateBlock,
} from "@/lib/document-editor/document-mutations";
import type { SignatureDocument } from "@/types/signature-document";

const baseDoc: SignatureDocument = {
  version: 1,
  templateId: "corporate-classic",
  targetPlatform: "generic",
  canvasWidth: 500,
  theme: {
    primaryColor: "#000",
    accentColor: "#000",
    textColor: "#111",
    mutedColor: "#666",
    borderColor: "#ccc",
  },
  blocks: [createBlock("heading")],
};

describe("document mutations", () => {
  it("inserts and removes blocks", () => {
    const spacer = createBlock("spacer");
    const withSpacer = insertBlock(baseDoc, spacer);
    expect(withSpacer.blocks).toHaveLength(2);
    const removed = removeBlock(withSpacer, spacer.id);
    expect(removed.blocks).toHaveLength(1);
  });

  it("reorders blocks", () => {
    const a = createBlock("divider");
    const b = createBlock("spacer");
    let doc = insertBlock(baseDoc, a);
    doc = insertBlock(doc, b);
    const reordered = reorderBlocks(doc, 0, 2);
    expect(reordered.blocks[2]?.type).toBe("heading");
  });

  it("updates block fields", () => {
    const id = baseDoc.blocks[0]!.id;
    const updated = updateBlock(baseDoc, id, { text: "Jane Guide" });
    expect(updated.blocks[0]).toMatchObject({ type: "heading", text: "Jane Guide" });
  });
});
