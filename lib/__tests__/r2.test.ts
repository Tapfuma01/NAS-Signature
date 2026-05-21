import { describe, expect, it } from "vitest";
import { sanitizeEnvValue } from "@/lib/env";
import { validateLogoFile } from "@/lib/r2-validation";

describe("sanitizeEnvValue", () => {
  it("strips quotes and inline comments", () => {
    expect(sanitizeEnvValue('  "https://cdn.example.com"  # public bucket  ')).toBe(
      "https://cdn.example.com",
    );
  });

  it("preserves hash in URLs without preceding space", () => {
    expect(sanitizeEnvValue("https://example.com/path#anchor")).toBe("https://example.com/path#anchor");
  });
});

describe("validateLogoFile", () => {
  it("accepts png under size limit", () => {
    const file = new File([new Uint8Array(100)], "logo.png", { type: "image/png" });
    expect(validateLogoFile(file)).toEqual({ ok: true, ext: "png" });
  });

  it("rejects unknown types", () => {
    const file = new File([new Uint8Array(10)], "doc.pdf", { type: "application/pdf" });
    expect(validateLogoFile(file).ok).toBe(false);
  });
});
