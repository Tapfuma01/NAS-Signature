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

export type SignatureBlock =
  | { id: string; type: "logo"; src: string; width: number; height: number; align: "left" | "center" }
  | { id: string; type: "heading"; text: string; level: "company" | "name" | "title" }
  | {
      id: string;
      type: "contact_row";
      label: string;
      valueField: "phone" | "email" | "whatsapp" | "custom";
      customValue?: string;
    }
  | { id: string; type: "divider"; variant?: "accent" | "line" }
  | { id: string; type: "social"; items: { network: string; url: string }[] }
  | { id: string; type: "footer_link"; label: string; url: string }
  | { id: string; type: "spacer"; height: number }
  | { id: string; type: "banner"; src: string; href?: string; width?: number; height?: number }
  | { id: string; type: "disclaimer"; text: string };

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
