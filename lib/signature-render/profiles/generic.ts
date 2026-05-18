import { BODY_FONT_SAFE, HEADING_FONT_LEGACY } from "@/lib/signature-render/utils";
import type { RenderProfile } from "@/lib/signature-render/profiles/types";

/** Baseline profile — preserves legacy HTML behavior (Montserrat stack in headings). */
export const genericProfile: RenderProfile = {
  platform: "generic",
  bodyFont: BODY_FONT_SAFE,
  headingFont: HEADING_FONT_LEGACY,
  strictOutlook: false,
  footerSeparator: "border-top",
  contactLabelWidth: 88,
};
