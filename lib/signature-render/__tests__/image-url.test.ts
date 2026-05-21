import { describe, expect, it } from "vitest";
import {
  isLocalhostImageUrl,
  resolveExportAssetsBaseUrl,
  toAbsoluteHttpsImageUrl,
} from "@/lib/signature-render/image-url";

describe("image-url", () => {
  it("upgrades http to https and resolves relative paths", () => {
    expect(toAbsoluteHttpsImageUrl("/c4-favicon.png", "https://signatures.example.com")).toBe(
      "https://signatures.example.com/c4-favicon.png",
    );
    expect(toAbsoluteHttpsImageUrl("http://cdn.example.com/logo.png", "")).toBe(
      "https://cdn.example.com/logo.png",
    );
  });

  it("detects localhost URLs", () => {
    expect(isLocalhostImageUrl("http://localhost:3000/c4-favicon.png")).toBe(true);
    expect(isLocalhostImageUrl("https://signatures.example.com/logo.png")).toBe(false);
  });

  it("prefers NEXT_PUBLIC_APP_URL over localhost base", () => {
    const prev = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://signatures.example.com";
    expect(resolveExportAssetsBaseUrl("http://localhost:3000")).toBe("https://signatures.example.com");
    process.env.NEXT_PUBLIC_APP_URL = prev;
  });
});
