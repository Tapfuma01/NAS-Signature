import { BODY_FONT_SAFE } from "@/lib/signature-render/utils";
import type { RenderProfile } from "@/lib/signature-render/profiles/types";

/** Gmail — simpler tables, web-safe fonts, moderate padding. */
export const googleWorkspaceProfile: RenderProfile = {
  platform: "google_workspace",
  bodyFont: BODY_FONT_SAFE,
  headingFont: BODY_FONT_SAFE,
  strictOutlook: false,
  footerSeparator: "border-top",
  contactLabelWidth: 88,
};
