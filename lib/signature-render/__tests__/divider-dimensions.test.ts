import { describe, expect, it } from "vitest";
import {
  defaultDividerThickness,
  resolveDividerThickness,
  resolveDividerWidth,
} from "@/lib/signature-render/divider-dimensions";
import { getLayoutStyleConfig } from "@/lib/signature-render/layout-styles/config";
import type { SignatureBlock } from "@/types/signature-document";

const accentBlock: Extract<SignatureBlock, { type: "divider" }> = {
  id: "d1",
  type: "divider",
  variant: "accent",
};

describe("divider dimensions", () => {
  it("defaults thickness by variant", () => {
    expect(defaultDividerThickness("accent")).toBe(3);
    expect(defaultDividerThickness("line")).toBe(1);
    expect(resolveDividerThickness({ ...accentBlock, thickness: 8 })).toBe(8);
    expect(resolveDividerThickness({ ...accentBlock, thickness: 99 })).toBe(24);
  });

  it("resolves custom width in px", () => {
    const layout = getLayoutStyleConfig("c4-classic");
    const w = resolveDividerWidth(
      { ...accentBlock, width: 120 },
      layout,
      500,
    );
    expect(w.widthAttr).toBe("120");
    expect(w.widthStyle).toBe("120px");
  });

  it("line variant defaults to full width when unset", () => {
    const layout = getLayoutStyleConfig("minimal-inline");
    const w = resolveDividerWidth(
      { id: "d", type: "divider", variant: "line" },
      layout,
      500,
    );
    expect(w.widthAttr).toBe("100%");
    expect(w.widthStyle).toBe("500px");
  });
});
