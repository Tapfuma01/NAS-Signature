import { describe, expect, it } from "vitest";
import { buildDocumentFromTemplate, getTemplateById, SIGNATURE_TEMPLATES } from "@/lib/templates";
import { renderSignatureDocument } from "@/lib/signature-render/render-document";
import { DEFAULT_ORG_BRAND } from "@/types/org-brand";

const FIELDS = {
  fullName: "Alex Guide",
  jobTitle: "Safari Specialist",
  phone: "+27 11 000 0000",
  email: "alex@example.com",
  whatsapp: "+27 82 000 0000",
  companyName: "C4 Photo Safaris",
  footerLinks: ["www.c4photosafaris.com"],
};

describe("template catalog", () => {
  it("ships six templates with unique ids and layout styles", () => {
    expect(SIGNATURE_TEMPLATES).toHaveLength(6);
    const ids = SIGNATURE_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(6);
    const styles = SIGNATURE_TEMPLATES.map((t) => t.layoutStyle);
    expect(new Set(styles).size).toBe(6);
  });

  it("maps unknown template id to corporate-classic", () => {
    expect(getTemplateById("default").id).toBe("corporate-classic");
    expect(getTemplateById("unknown-id").id).toBe("corporate-classic");
  });

  it("renders distinct HTML per template", () => {
    const theme = {
      primaryColor: DEFAULT_ORG_BRAND.primaryColor,
      accentColor: DEFAULT_ORG_BRAND.accentColor,
      textColor: DEFAULT_ORG_BRAND.textColor,
      mutedColor: DEFAULT_ORG_BRAND.mutedColor,
      borderColor: DEFAULT_ORG_BRAND.borderColor,
    };
    const htmlByTemplate = SIGNATURE_TEMPLATES.map((t) => {
      const document = buildDocumentFromTemplate({
        templateId: t.id,
        fields: FIELDS,
        theme,
        assetsBaseUrl: "https://example.com",
        orgLogoUrl: "",
      });
      return renderSignatureDocument({
        document,
        fields: FIELDS,
        assetsBaseUrl: "https://example.com",
        orgLogoUrl: "",
      });
    });
    expect(new Set(htmlByTemplate).size).toBe(6);
    expect(htmlByTemplate.find((h) => h.includes("confidential"))).toBeTruthy();
    expect(htmlByTemplate.find((h) => h.includes("&nbsp;·&nbsp;"))).toBeTruthy();
  });
});
