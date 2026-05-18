import { describe, expect, it } from "vitest";
import { buildOutlookHtmFile, wrapHtmlForClipboard } from "@/lib/clipboard-html";

const TABLE = '<table width="500"><tr><td>Hi</td></tr></table>';

describe("clipboard-html", () => {
  it("wraps Outlook desktop HTML with fragment markers", () => {
    const html = wrapHtmlForClipboard(TABLE, "outlook_desktop");
    expect(html).toContain("StartFragment");
    expect(html).toContain("EndFragment");
    expect(html).toContain('xmlns:o="urn:schemas-microsoft-com:office:office"');
    expect(html).toContain(TABLE);
  });

  it("wraps Gmail HTML in minimal document", () => {
    const html = wrapHtmlForClipboard(TABLE, "google_workspace");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain(TABLE);
  });

  it("leaves generic HTML unchanged", () => {
    expect(wrapHtmlForClipboard(TABLE, "generic")).toBe(TABLE);
  });

  it("builds downloadable htm file", () => {
    const file = buildOutlookHtmFile(TABLE, "Test Sig");
    expect(file).toContain("<title>Test Sig</title>");
    expect(file).toContain(TABLE);
  });
});
