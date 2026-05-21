import { BODY_FONT_SAFE } from "@/lib/signature-render/utils";
import type { RenderProfile } from "@/lib/signature-render/profiles/types";

/** Outlook on the web / Microsoft 365 — between generic and desktop strictness. */
export const microsoft365Profile: RenderProfile = {
  platform: "microsoft_365",
  bodyFont: BODY_FONT_SAFE,
  headingFont: BODY_FONT_SAFE,
  strictOutlook: true,
  contactLabelWidth: 88,
};
