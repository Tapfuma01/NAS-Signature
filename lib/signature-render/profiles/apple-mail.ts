import { BODY_FONT_SAFE, HEADING_FONT_LEGACY } from "@/lib/signature-render/utils";
import type { RenderProfile } from "@/lib/signature-render/profiles/types";

/** Apple Mail — close to generic with web-safe body. */
export const appleMailProfile: RenderProfile = {
  platform: "apple_mail",
  bodyFont: BODY_FONT_SAFE,
  headingFont: HEADING_FONT_LEGACY,
  strictOutlook: false,
  contactLabelWidth: 88,
};
