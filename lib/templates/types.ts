import type { SignatureBlock, SignatureTheme } from "@/types/signature-document";

export type TemplateCategory =
  | "Corporate"
  | "Creative"
  | "Minimal"
  | "Social"
  | "Legal"
  | "Photo";

export type TemplateLayoutStyle =
  | "c4-classic"
  | "c4-sidebar"
  | "c4-hero"
  | "minimal-inline"
  | "compact-stack"
  | "legal-stack"
  | "social-bar";

export const TEMPLATE_LAYOUT_STYLES: TemplateLayoutStyle[] = [
  "c4-classic",
  "c4-sidebar",
  "c4-hero",
  "minimal-inline",
  "compact-stack",
  "legal-stack",
  "social-bar",
];

export type SignatureTemplateDefinition = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  canvasWidth: 500 | 600;
  layoutStyle: TemplateLayoutStyle;
  /** Layout blocks; dynamic copy is hydrated from field values at render time. */
  blocks: SignatureBlock[];
  /** Optional theme overrides merged on top of org brand. */
  themeOverrides?: Partial<SignatureTheme>;
};
