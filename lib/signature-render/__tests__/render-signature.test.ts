import { describe, expect, it } from "vitest";
import { formToDocument } from "@/lib/signature-render/form-to-document";
import { getRenderProfile } from "@/lib/signature-render/profiles";
import { renderSignatureDocument } from "@/lib/signature-render/render-document";
import { contentToFieldValues } from "@/lib/signature-render/form-to-document";
import { getLayoutStyleConfig } from "@/lib/signature-render/layout-styles/config";
import { DEFAULT_ORG_BRAND } from "@/types/org-brand";
import type { TargetPlatform } from "@/types/signature-document";
import { TARGET_PLATFORMS } from "@/types/signature-document";
import { SIGNATURE_TEMPLATES } from "@/lib/templates/catalog";
import { buildDocumentFromTemplate } from "@/lib/templates";

const SAMPLE = {
  ...DEFAULT_ORG_BRAND,
  fullName: "Jane Safari",
  jobTitle: "Lead Guide",
  phone: "+27 11 123 4567",
  email: "jane@c4photosafaris.com",
  whatsapp: "+27 82 123 4567",
  customFields: {},
  assetsBaseUrl: "https://signatures.example.com",
  templateId: "corporate-classic",
};

function renderForPlatform(platform: TargetPlatform, templateId = "corporate-classic"): string {
  const document = formToDocument({ ...SAMPLE, targetPlatform: platform, templateId });
  const fields = contentToFieldValues(SAMPLE);
  return renderSignatureDocument({
    document,
    fields,
    assetsBaseUrl: SAMPLE.assetsBaseUrl,
    orgLogoUrl: SAMPLE.logoUrl,
    options: { assetsBaseUrl: SAMPLE.assetsBaseUrl, targetPlatform: platform },
  });
}

function normalizeHtml(html: string): string {
  return html.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
}

describe("renderSignatureDocument", () => {
  it("generic profile matches corporate-classic structure", () => {
    const html = normalizeHtml(renderForPlatform("generic"));
    expect(html).toContain('width="500"');
    expect(html).toContain("Jane Safari");
    expect(html).toContain("Lead Guide");
    expect(html).toContain("mailto:jane@c4photosafaris.com");
    expect(html).toContain("www.c4photosafaris.com");
    expect(html).toContain("mso-table-lspace:0pt");
  });

  it("renders up to three footer websites separated by dividers in lowercase", () => {
    const fields = contentToFieldValues({
      ...SAMPLE,
      footerLinks: ["HTTPS://ONE.COM", "Two.com", "https://THREE.COM/Path"],
    });
    const document = buildDocumentFromTemplate({
      templateId: "footer-triple",
      template: {
        id: "footer-triple",
        name: "Footer triple",
        description: "",
        category: "Corporate",
        canvasWidth: 500,
        layoutStyle: "compact-stack",
        blocks: [{ id: "footer", type: "footer_link", label: "", url: "" }],
      },
      fields,
      theme: {
        primaryColor: DEFAULT_ORG_BRAND.primaryColor,
        accentColor: DEFAULT_ORG_BRAND.accentColor,
        textColor: DEFAULT_ORG_BRAND.textColor,
        mutedColor: DEFAULT_ORG_BRAND.mutedColor,
        borderColor: DEFAULT_ORG_BRAND.borderColor,
      },
      assetsBaseUrl: SAMPLE.assetsBaseUrl,
      orgLogoUrl: "",
    });
    const html = normalizeHtml(
      renderSignatureDocument({ document, fields, assetsBaseUrl: SAMPLE.assetsBaseUrl, orgLogoUrl: "" }),
    );
    expect(html).toContain("one.com");
    expect(html).toContain("two.com");
    expect(html).toContain("three.com/path");
    expect(html).toContain("|");
  });

  it("produces distinct HTML per platform profile", () => {
    const byPlatform = Object.fromEntries(
      TARGET_PLATFORMS.map((p) => [p, normalizeHtml(renderForPlatform(p))]),
    ) as Record<TargetPlatform, string>;

    expect(byPlatform.outlook_desktop).not.toBe(byPlatform.generic);
    expect(byPlatform.outlook_desktop).toContain("mso-line-height-rule:exactly");
  });

  it("produces distinct HTML per layout style", () => {
    const fields = contentToFieldValues(SAMPLE);
    const htmlByTemplate = SIGNATURE_TEMPLATES.map((template) => {
      const document = formToDocument({
        ...SAMPLE,
        templateId: template.id,
        targetPlatform: "generic",
      });
      return normalizeHtml(
        renderSignatureDocument({
          document,
          fields,
          assetsBaseUrl: SAMPLE.assetsBaseUrl,
          orgLogoUrl: "",
          options: { assetsBaseUrl: SAMPLE.assetsBaseUrl, targetPlatform: "generic" },
        }),
      );
    });
    expect(new Set(htmlByTemplate).size).toBe(SIGNATURE_TEMPLATES.length);
  });

  it("minimal-inline uses inline contact separator", () => {
    const html = normalizeHtml(renderForPlatform("generic", "corporate-minimal"));
    expect(html).toContain("&nbsp;·&nbsp;");
  });

  it("social-bar uses pill-style social cells", () => {
    const html = normalizeHtml(renderForPlatform("generic", "social-heavy"));
    expect(html).toContain("Website");
    expect(html).toContain("bgcolor=");
  });

  it("legal-stack wraps disclaimer in border", () => {
    const html = normalizeHtml(renderForPlatform("generic", "legal-footer"));
    expect(html).toContain("confidential");
    expect(html).toContain("border:1px solid");
  });

  it("c4-hero uses full-width accent bar table", () => {
    const html = normalizeHtml(renderForPlatform("generic", "photo-safari"));
    expect(html).toContain('width="600"');
    expect(html).toContain('width="100%"');
  });

  it("snapshots stable HTML per platform", () => {
    for (const platform of TARGET_PLATFORMS) {
      expect(normalizeHtml(renderForPlatform(platform))).toMatchSnapshot(platform);
    }
  });

  it("getRenderProfile returns Aptos stack for outlook desktop", () => {
    const profile = getRenderProfile("outlook_desktop");
    expect(profile.bodyFont).toBe("Aptos, 'Segoe UI', Arial, Helvetica, sans-serif");
    expect(profile.headingFont).toContain("Aptos");
    expect(profile.strictOutlook).toBe(true);
  });

  it("each catalog template has a layout style config", () => {
    for (const t of SIGNATURE_TEMPLATES) {
      expect(getLayoutStyleConfig(t.layoutStyle).style).toBe(t.layoutStyle);
    }
  });

  it("renders member custom contact values with tel links", () => {
    const fields = contentToFieldValues(SAMPLE);
    const document = buildDocumentFromTemplate({
      templateId: "dynamic-mobile",
      template: {
        id: "dynamic-mobile",
        name: "Dynamic Mobile",
        description: "",
        category: "Corporate",
        canvasWidth: 500,
        layoutStyle: "compact-stack",
        blocks: [
          { id: "name", type: "heading", level: "name", text: "Name" },
          {
            id: "mobile",
            type: "contact_row",
            label: "Mobile",
            valueField: "custom",
            customValue: "Call us",
            customInputType: "tel",
          },
        ],
      },
      fields,
      theme: {
        primaryColor: DEFAULT_ORG_BRAND.primaryColor,
        accentColor: DEFAULT_ORG_BRAND.accentColor,
        textColor: DEFAULT_ORG_BRAND.textColor,
        mutedColor: DEFAULT_ORG_BRAND.mutedColor,
        borderColor: DEFAULT_ORG_BRAND.borderColor,
      },
      assetsBaseUrl: SAMPLE.assetsBaseUrl,
      orgLogoUrl: "",
      customFields: { mobile: "+27 11 888 9999" },
    });
    const html = normalizeHtml(
      renderSignatureDocument({ document, fields, assetsBaseUrl: SAMPLE.assetsBaseUrl, orgLogoUrl: "" }),
    );
    expect(html).toContain("tel:+27118889999");
    expect(html).toContain("+27 11 888 9999");
  });

  it("falls back to template placeholder when custom value is blank", () => {
    const fields = contentToFieldValues(SAMPLE);
    const document = buildDocumentFromTemplate({
      templateId: "dynamic-fallback",
      template: {
        id: "dynamic-fallback",
        name: "Dynamic fallback",
        description: "",
        category: "Corporate",
        canvasWidth: 500,
        layoutStyle: "compact-stack",
        blocks: [
          { id: "name", type: "heading", level: "name", text: "Name" },
          {
            id: "mobile",
            type: "contact_row",
            label: "Mobile",
            valueField: "custom",
            customValue: "Call us",
            customInputType: "tel",
          },
        ],
      },
      fields,
      theme: {
        primaryColor: DEFAULT_ORG_BRAND.primaryColor,
        accentColor: DEFAULT_ORG_BRAND.accentColor,
        textColor: DEFAULT_ORG_BRAND.textColor,
        mutedColor: DEFAULT_ORG_BRAND.mutedColor,
        borderColor: DEFAULT_ORG_BRAND.borderColor,
      },
      assetsBaseUrl: SAMPLE.assetsBaseUrl,
      orgLogoUrl: "",
      customFields: { mobile: "   " },
    });
    const html = normalizeHtml(
      renderSignatureDocument({ document, fields, assetsBaseUrl: SAMPLE.assetsBaseUrl, orgLogoUrl: "" }),
    );
    expect(html).toContain("Call us");
  });
});
