import type { TemplateLayoutStyle } from "@/lib/templates/types";

export type ContactMode = "labeled" | "inline" | "stacked";
export type FooterMode = "c4-uppercase" | "neutral";
export type SocialMode = "links" | "pills";
export type DividerAccentWidth = "short" | "full";

export type LayoutStyleConfig = {
  style: TemplateLayoutStyle;
  useSidebarLayout: boolean;
  contactMode: ContactMode;
  footerMode: FooterMode;
  socialMode: SocialMode;
  dividerAccentWidth: DividerAccentWidth;
  companyFontSize: string;
  companyLetterSpacing: string;
  companyUppercase: boolean;
  nameFontSize: string;
  namePaddingBottom: string;
  titleFontSize: string;
  titlePaddingBottom: string;
  disclaimerBordered: boolean;
};

const CONFIGS: Record<TemplateLayoutStyle, LayoutStyleConfig> = {
  "c4-classic": {
    style: "c4-classic",
    useSidebarLayout: false,
    contactMode: "labeled",
    footerMode: "c4-uppercase",
    socialMode: "links",
    dividerAccentWidth: "short",
    companyFontSize: "12px",
    companyLetterSpacing: "0.18em",
    companyUppercase: true,
    nameFontSize: "17px",
    namePaddingBottom: "4px",
    titleFontSize: "13px",
    titlePaddingBottom: "14px",
    disclaimerBordered: false,
  },
  "c4-sidebar": {
    style: "c4-sidebar",
    useSidebarLayout: true,
    contactMode: "labeled",
    footerMode: "c4-uppercase",
    socialMode: "links",
    dividerAccentWidth: "short",
    companyFontSize: "11px",
    companyLetterSpacing: "0.14em",
    companyUppercase: true,
    nameFontSize: "16px",
    namePaddingBottom: "2px",
    titleFontSize: "12px",
    titlePaddingBottom: "10px",
    disclaimerBordered: false,
  },
  "c4-hero": {
    style: "c4-hero",
    useSidebarLayout: false,
    contactMode: "labeled",
    footerMode: "c4-uppercase",
    socialMode: "links",
    dividerAccentWidth: "full",
    companyFontSize: "12px",
    companyLetterSpacing: "0.2em",
    companyUppercase: true,
    nameFontSize: "18px",
    namePaddingBottom: "6px",
    titleFontSize: "14px",
    titlePaddingBottom: "16px",
    disclaimerBordered: false,
  },
  "minimal-inline": {
    style: "minimal-inline",
    useSidebarLayout: false,
    contactMode: "inline",
    footerMode: "neutral",
    socialMode: "links",
    dividerAccentWidth: "short",
    companyFontSize: "11px",
    companyLetterSpacing: "0.04em",
    companyUppercase: false,
    nameFontSize: "15px",
    namePaddingBottom: "2px",
    titleFontSize: "12px",
    titlePaddingBottom: "10px",
    disclaimerBordered: false,
  },
  "compact-stack": {
    style: "compact-stack",
    useSidebarLayout: false,
    contactMode: "stacked",
    footerMode: "neutral",
    socialMode: "links",
    dividerAccentWidth: "short",
    companyFontSize: "10px",
    companyLetterSpacing: "0.06em",
    companyUppercase: true,
    nameFontSize: "15px",
    namePaddingBottom: "2px",
    titleFontSize: "12px",
    titlePaddingBottom: "6px",
    disclaimerBordered: false,
  },
  "legal-stack": {
    style: "legal-stack",
    useSidebarLayout: false,
    contactMode: "labeled",
    footerMode: "neutral",
    socialMode: "links",
    dividerAccentWidth: "short",
    companyFontSize: "11px",
    companyLetterSpacing: "0.06em",
    companyUppercase: false,
    nameFontSize: "16px",
    namePaddingBottom: "2px",
    titleFontSize: "12px",
    titlePaddingBottom: "8px",
    disclaimerBordered: true,
  },
  "social-bar": {
    style: "social-bar",
    useSidebarLayout: true,
    contactMode: "labeled",
    footerMode: "c4-uppercase",
    socialMode: "pills",
    dividerAccentWidth: "short",
    companyFontSize: "11px",
    companyLetterSpacing: "0.12em",
    companyUppercase: true,
    nameFontSize: "16px",
    namePaddingBottom: "2px",
    titleFontSize: "12px",
    titlePaddingBottom: "8px",
    disclaimerBordered: false,
  },
};

export function getLayoutStyleConfig(style: TemplateLayoutStyle): LayoutStyleConfig {
  return CONFIGS[style] ?? CONFIGS["c4-classic"];
}
