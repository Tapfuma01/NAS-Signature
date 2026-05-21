import type { TargetPlatform } from "@/types/signature-document";

export type RenderProfile = {
  platform: TargetPlatform;
  bodyFont: string;
  headingFont: string;
  /** Extra MSO / line-height hints on text cells (Outlook desktop). */
  strictOutlook: boolean;
  /** Label column width for contact rows. */
  contactLabelWidth: number;
};
