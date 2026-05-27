import type { OrganizationSettings } from "@/types/organization-settings";

export type OrgBrand = {
  companyName: string;
  /** One to three website strings (as entered) for the footer. */
  footerLinks: string[];
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
};

export const DEFAULT_ORG_BRAND: OrgBrand = {
  companyName: "C4 Photo Safaris",
  footerLinks: ["https://www.c4photosafaris.com"],
  logoUrl: "",
  primaryColor: "#C69C6D",
  accentColor: "#C69C6D",
  textColor: "#1a1a1a",
  mutedColor: "#6b6b64",
  borderColor: "#e8ddd0",
};

export function organizationRowToOrgBrand(row: OrganizationSettings): OrgBrand {
  const links = [row.footer_url, row.footer_url_2, row.footer_url_3]
    .map((v) => (v ?? "").trim())
    .filter(Boolean);
  return {
    companyName: row.company_name,
    footerLinks: links.length > 0 ? links : DEFAULT_ORG_BRAND.footerLinks,
    logoUrl: row.logo_url.trim(),
    primaryColor: row.primary_color,
    accentColor: row.accent_color,
    textColor: row.text_color,
    mutedColor: row.muted_color,
    borderColor: row.border_color,
  };
}
