import { BODY_FONT_SAFE } from "@/lib/signature-render/utils";
import type { RenderProfile } from "@/lib/signature-render/profiles/types";

/** Word HTML engine — web-safe fonts only, table-based separators, MSO hints. */
export const outlookDesktopProfile: RenderProfile = {
  platform: "outlook_desktop",
  bodyFont: BODY_FONT_SAFE,
  headingFont: BODY_FONT_SAFE,
  strictOutlook: true,
  contactLabelWidth: 90,
};
