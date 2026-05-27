import { BODY_FONT_SAFE, HEADING_FONT_LEGACY } from "@/lib/signature-render/utils";
import type { RenderProfile } from "@/lib/signature-render/profiles/types";

/** Baseline profile — Aptos stack for body and headings. */
export const genericProfile: RenderProfile = {
  platform: "generic",
  bodyFont: BODY_FONT_SAFE,
  headingFont: HEADING_FONT_LEGACY,
  strictOutlook: false,
  contactLabelWidth: 88,
};
