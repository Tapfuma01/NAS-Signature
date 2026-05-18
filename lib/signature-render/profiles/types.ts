import type { TargetPlatform } from "@/types/signature-document";

export type RenderProfile = {
  platform: TargetPlatform;
  bodyFont: string;
  headingFont: string;
  /** Extra MSO / line-height hints on text cells (Outlook desktop). */
  strictOutlook: boolean;
  /** Footer separator: CSS border on td vs nested 1px bgcolor table. */
  footerSeparator: "border-top" | "table-row";
  /** Label column width for contact rows. */
  contactLabelWidth: number;
};
