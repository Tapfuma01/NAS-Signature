import { describe, expect, it } from "vitest";
import { timingSafeEqual } from "crypto";

/** Mirror tokensMatch from public-edit.ts for unit testing without DB. */
function tokensMatch(stored: string, provided: string): boolean {
  const a = Buffer.from(stored, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

describe("edit token comparison", () => {
  it("accepts matching tokens", () => {
    const token = "a".repeat(48);
    expect(tokensMatch(token, token)).toBe(true);
  });

  it("rejects mismatched tokens", () => {
    expect(tokensMatch("abc", "abd")).toBe(false);
  });

  it("rejects different lengths", () => {
    expect(tokensMatch("short", "longer-token")).toBe(false);
  });
});
