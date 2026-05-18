import type { TargetPlatform } from "@/types/signature-document";

export type PlatformMeta = {
  id: TargetPlatform;
  label: string;
  shortLabel: string;
  hint: string;
  copyButtonLabel: string;
  copySuccessTitle: string;
  copySuccessDescription: string;
  plainTextFallbackHint: string;
  installAccordionTitle: string;
  installSteps: string[];
  installTips?: string[];
};

export const PLATFORM_META: Record<TargetPlatform, PlatformMeta> = {
  outlook_desktop: {
    id: "outlook_desktop",
    label: "Outlook (desktop)",
    shortLabel: "Outlook desktop",
    hint: "Strictest HTML — Word rendering engine. Use the signature editor, not a new message.",
    copyButtonLabel: "Copy for Outlook desktop",
    copySuccessTitle: "Copied for Outlook desktop",
    copySuccessDescription:
      "Paste into File → Options → Mail → Signatures. If formatting looks off, try Download .htm below.",
    plainTextFallbackHint: "Outlook desktop needs rich HTML — try Chrome or Edge, or use Download .htm.",
    installAccordionTitle: "Microsoft Outlook (desktop)",
    installSteps: [
      "Open Outlook. Go to File → Options → Mail → Signatures (or Outlook → Settings → Signatures on Mac).",
      "Under “Select signature to edit”, click New, name your signature, then select it.",
      "Click inside the signature editor, then paste (Ctrl+V / ⌘V). Do not paste into a new email body.",
      "Under “Choose default signature”, assign it for New messages and Replies/forwards, then OK.",
    ],
    installTips: [
      "If images are missing, confirm logo URLs use https:// and are publicly reachable (not localhost).",
      "For IT rollout, use Download .htm and distribute via your email signature policy.",
    ],
  },
  microsoft_365: {
    id: "microsoft_365",
    label: "Microsoft 365 / Outlook web",
    shortLabel: "Microsoft 365",
    hint: "Outlook on the web and new Outlook app",
    copyButtonLabel: "Copy for Microsoft 365",
    copySuccessTitle: "Copied for Microsoft 365",
    copySuccessDescription: "Paste into Outlook on the web signature settings.",
    plainTextFallbackHint: "Rich HTML copy failed — retry in Chrome/Edge or paste plain text and reformat.",
    installAccordionTitle: "Microsoft 365 / Outlook on the web",
    installSteps: [
      "Open Outlook on the web (outlook.office.com) and go to Settings (gear) → Account → Signatures.",
      "Create or edit a signature, click in the editor, and paste (Ctrl+V / ⌘V).",
      "Set the signature as default for new messages and replies if prompted, then save.",
    ],
    installTips: ["New Outlook for Windows uses the same signature settings as Outlook on the web."],
  },
  google_workspace: {
    id: "google_workspace",
    label: "Google Workspace (Gmail)",
    shortLabel: "Gmail",
    hint: "Gmail web and mobile — paste in Settings, not the compose box",
    copyButtonLabel: "Copy for Gmail",
    copySuccessTitle: "Copied for Gmail",
    copySuccessDescription: "Paste into Gmail → Settings → Signature. Avoid pasting into a draft email.",
    plainTextFallbackHint: "Gmail works best with rich HTML from Chrome or Edge.",
    installAccordionTitle: "Google Workspace (Gmail)",
    installSteps: [
      "Open Gmail in a browser. Click Settings (gear) → See all settings.",
      "Scroll to “Signature”, create or edit a signature, click in the rich text area, and paste.",
      "Choose the signature for new emails and replies at the bottom of the section, then Save Changes.",
    ],
    installTips: [
      "Gmail may strip some styles — the copy is already simplified for Gmail.",
      "Very large signatures can be clipped (~102KB); keep banners optimized.",
    ],
  },
  apple_mail: {
    id: "apple_mail",
    label: "Apple Mail",
    shortLabel: "Apple Mail",
    hint: "macOS and iOS Mail",
    copyButtonLabel: "Copy for Apple Mail",
    copySuccessTitle: "Copied for Apple Mail",
    copySuccessDescription: "Paste into Mail → Settings → Signatures on Mac, or Settings → Mail → Signature on iPhone.",
    plainTextFallbackHint: "Use Safari on Mac for best rich paste into Mail.",
    installAccordionTitle: "Apple Mail",
    installSteps: [
      "On Mac: Mail → Settings → Signatures. Select your account and click “+” to add a signature.",
      "Uncheck “Always match my default message font” if present, then paste into the preview pane.",
      "On iPhone: Settings → Mail → Signature, paste per account or use a single signature for all accounts.",
    ],
    installTips: ["Remote images must be loaded once — send yourself a test email if logos appear blank."],
  },
  generic: {
    id: "generic",
    label: "Generic / other",
    shortLabel: "email",
    hint: "Safest cross-client baseline",
    copyButtonLabel: "Copy signature",
    copySuccessTitle: "Copied to clipboard",
    copySuccessDescription: "Rich HTML and plain text were copied where supported.",
    plainTextFallbackHint: "Your browser blocked rich HTML — plain text was copied instead.",
    installAccordionTitle: "Other email apps",
    installSteps: [
      "Open your email app’s signature or account settings.",
      "Find the signature editor (often under Settings → Signature or Account).",
      "Paste (Ctrl+V / ⌘V). If formatting breaks, try your app’s “insert HTML” option or contact IT.",
    ],
  },
};

export function getPlatformMeta(platform: TargetPlatform): PlatformMeta {
  return PLATFORM_META[platform] ?? PLATFORM_META.generic;
}

export function copyButtonLabel(platform: TargetPlatform): string {
  return getPlatformMeta(platform).copyButtonLabel;
}
