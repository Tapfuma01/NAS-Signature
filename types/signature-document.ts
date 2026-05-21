import type { BlockStyle } from "@/types/block-style";

/** Target email client for export tuning. */
export type TargetPlatform =
  | "outlook_desktop"
  | "microsoft_365"
  | "google_workspace"
  | "apple_mail"
  | "generic";

export const TARGET_PLATFORMS: TargetPlatform[] = [
  "outlook_desktop",
  "microsoft_365",
  "google_workspace",
  "apple_mail",
  "generic",
];

export type SignatureTheme = {
  primaryColor: string;
  accentColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
};

type BlockBase = { id: string; style?: BlockStyle };

export type SignatureBlock =
  | (BlockBase & {
      type: "logo";
      src: string;
      width: number;
      height: number;
      align: "left" | "center";
    })
  | (BlockBase & { type: "heading"; text: string; level: "company" | "name" | "title" })
  | (BlockBase & {
      type: "contact_row";
      label: string;
      valueField: "phone" | "email" | "whatsapp" | "custom";
      customValue?: string;
    })
  | (BlockBase & {
      type: "divider";
      variant?: "accent" | "line";
      /** Override bar/line color (hex). Falls back to theme primary/border. */
      color?: string;
      /** Bar/line thickness in px (1–24). Default: 3 accent, 1 line. */
      thickness?: number;
      /** full = canvas width, short = 80px preset, or explicit width in px. */
      width?: "full" | "short" | number;
    })
  | (BlockBase & { type: "social"; items: { network: string; url: string }[] })
  | (BlockBase & { type: "footer_link"; label: string; url: string })
  | (BlockBase & { type: "spacer"; height: number })
  | (BlockBase & {
      type: "banner";
      src: string;
      href?: string;
      width?: number;
      height?: number;
    })
  | (BlockBase & { type: "disclaimer"; text: string });

export type SignatureDocument = {
  version: 1;
  templateId: string;
  targetPlatform: TargetPlatform;
  canvasWidth: 500 | 600;
  blocks: SignatureBlock[];
  theme: SignatureTheme;
};

/** Resolved field values when compiling a document (from form state or stored block text). */
export type SignatureFieldValues = {
  fullName: string;
  jobTitle: string;
  phone: string;
  email: string;
  whatsapp: string;
  companyName: string;
  footerDisplay: string;
  footerUrl: string;
};

export type RenderSignatureOptions = {
  assetsBaseUrl: string;
  /** Override document.targetPlatform for this render (e.g. copy for Outlook). */
  targetPlatform?: TargetPlatform;
};
