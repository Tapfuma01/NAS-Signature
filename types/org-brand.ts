import type { OrganizationSettings } from "@/types/organization-settings";

export type OrgBrand = {
  companyName: string;
  /** Short label for footer (e.g. www.example.com). */
  footerDisplay: string;
  /** Full website URL for links. */
  footerUrl: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
};

export const DEFAULT_ORG_BRAND: OrgBrand = {
  companyName: "C4 Photo Safaris",
  footerDisplay: "www.c4photosafaris.com",
  footerUrl: "https://www.c4photosafaris.com",
  logoUrl: "",
  primaryColor: "#C69C6D",
  accentColor: "#C69C6D",
  textColor: "#1a1a1a",
  mutedColor: "#6b6b64",
  borderColor: "#e8ddd0",
};

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export function organizationRowToOrgBrand(row: OrganizationSettings): OrgBrand {
  const footer = row.footer_url.trim() || DEFAULT_ORG_BRAND.footerUrl;
  return {
    companyName: row.company_name,
    footerDisplay: stripProtocol(footer),
    footerUrl: footer.startsWith("http") ? footer : `https://${footer}`,
    logoUrl: row.logo_url.trim(),
    primaryColor: row.primary_color,
    accentColor: row.accent_color,
    textColor: row.text_color,
    mutedColor: row.muted_color,
    borderColor: row.border_color,
  };
}
