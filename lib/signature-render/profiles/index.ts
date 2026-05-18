import { appleMailProfile } from "@/lib/signature-render/profiles/apple-mail";
import { genericProfile } from "@/lib/signature-render/profiles/generic";
import { googleWorkspaceProfile } from "@/lib/signature-render/profiles/google-workspace";
import { microsoft365Profile } from "@/lib/signature-render/profiles/microsoft-365";
import { outlookDesktopProfile } from "@/lib/signature-render/profiles/outlook-desktop";
import type { RenderProfile } from "@/lib/signature-render/profiles/types";
import type { TargetPlatform } from "@/types/signature-document";

const PROFILES: Record<TargetPlatform, RenderProfile> = {
  generic: genericProfile,
  outlook_desktop: outlookDesktopProfile,
  microsoft_365: microsoft365Profile,
  google_workspace: googleWorkspaceProfile,
  apple_mail: appleMailProfile,
};

export function getRenderProfile(platform: TargetPlatform): RenderProfile {
  return PROFILES[platform] ?? genericProfile;
}

export {
  appleMailProfile,
  genericProfile,
  googleWorkspaceProfile,
  microsoft365Profile,
  outlookDesktopProfile,
};
