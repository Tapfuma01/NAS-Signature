import { describe, expect, it } from "vitest";
import {
  buildSignatureInviteHtml,
  buildSignatureInviteText,
} from "@/lib/brevo/email-templates";

describe("buildSignatureInviteText", () => {
  it("includes install URL with token", () => {
    const url = "https://signatures.example.com/jane-doe?token=abc123";
    const text = buildSignatureInviteText({
      recipientName: "Jane",
      companyName: "C4 Photo Safaris",
      installUrl: url,
    });
    expect(text).toContain(url);
    expect(text).toContain("Hi Jane");
  });
});

describe("buildSignatureInviteHtml", () => {
  it("includes install URL in CTA href", () => {
    const url = "https://signatures.example.com/jane-doe?token=secret48";
    const html = buildSignatureInviteHtml({
      recipientName: "Jane",
      companyName: "C4",
      installUrl: url,
    });
    expect(html).toContain(`href="${url}"`);
    expect(html).toContain("Set up my signature");
  });
});
