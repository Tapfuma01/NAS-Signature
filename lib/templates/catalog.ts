import type { SignatureTemplateDefinition } from "@/lib/templates/types";

const corporateClassic: SignatureTemplateDefinition = {
  id: "corporate-classic",
  name: "Corporate Classic",
  description: "C4 editorial stack — logo, gold rule, and refined contact rows.",
  category: "Corporate",
  canvasWidth: 500,
  layoutStyle: "c4-classic",
  blocks: [
    { id: "logo", type: "logo", src: "", width: 180, height: 48, align: "left" },
    { id: "company", type: "heading", level: "company", text: "" },
    { id: "accent-bar", type: "divider", variant: "accent" },
    { id: "name", type: "heading", level: "name", text: "" },
    { id: "title", type: "heading", level: "title", text: "" },
    { id: "phone", type: "contact_row", label: "Phone", valueField: "phone" },
    { id: "email", type: "contact_row", label: "Email", valueField: "email" },
    { id: "whatsapp", type: "contact_row", label: "WhatsApp", valueField: "whatsapp" },
    { id: "footer", type: "footer_link", label: "", url: "" },
  ],
};

const corporateMinimal: SignatureTemplateDefinition = {
  id: "corporate-minimal",
  name: "Corporate Minimal",
  description: "Neutral, modern — inline contacts without logo or label columns.",
  category: "Minimal",
  canvasWidth: 500,
  layoutStyle: "minimal-inline",
  blocks: [
    { id: "company", type: "heading", level: "company", text: "" },
    { id: "line", type: "divider", variant: "line" },
    { id: "name", type: "heading", level: "name", text: "" },
    { id: "title", type: "heading", level: "title", text: "" },
    { id: "phone", type: "contact_row", label: "Phone", valueField: "phone" },
    { id: "email", type: "contact_row", label: "Email", valueField: "email" },
    { id: "footer", type: "footer_link", label: "", url: "" },
  ],
};

const photoSafari: SignatureTemplateDefinition = {
  id: "photo-safari",
  name: "Photo Safari",
  description: "C4 hero layout — full-width gold rule and prominent name (600px).",
  category: "Photo",
  canvasWidth: 600,
  layoutStyle: "c4-hero",
  themeOverrides: {
    borderColor: "#e0d4c4",
  },
  blocks: [
    { id: "logo", type: "logo", src: "", width: 200, height: 52, align: "left" },
    { id: "company", type: "heading", level: "company", text: "" },
    { id: "accent-bar", type: "divider", variant: "accent" },
    { id: "name", type: "heading", level: "name", text: "" },
    { id: "title", type: "heading", level: "title", text: "" },
    { id: "spacer", type: "spacer", height: 6 },
    { id: "phone", type: "contact_row", label: "Phone", valueField: "phone" },
    { id: "email", type: "contact_row", label: "Email", valueField: "email" },
    { id: "whatsapp", type: "contact_row", label: "WhatsApp", valueField: "whatsapp" },
    { id: "footer", type: "footer_link", label: "", url: "" },
  ],
};

const compactMobile: SignatureTemplateDefinition = {
  id: "compact-mobile",
  name: "Compact Mobile",
  description: "Tight stack for mobile Gmail — name first, essentials only.",
  category: "Minimal",
  canvasWidth: 500,
  layoutStyle: "compact-stack",
  blocks: [
    { id: "name", type: "heading", level: "name", text: "" },
    { id: "title", type: "heading", level: "title", text: "" },
    { id: "company", type: "heading", level: "company", text: "" },
    { id: "email", type: "contact_row", label: "Email", valueField: "email" },
    { id: "phone", type: "contact_row", label: "Phone", valueField: "phone" },
    { id: "footer", type: "footer_link", label: "", url: "" },
  ],
};

const legalFooter: SignatureTemplateDefinition = {
  id: "legal-footer",
  name: "Legal Footer",
  description: "Neutral compliance layout with bordered disclaimer block.",
  category: "Legal",
  canvasWidth: 500,
  layoutStyle: "legal-stack",
  blocks: [
    { id: "logo", type: "logo", src: "", width: 160, height: 44, align: "left" },
    { id: "name", type: "heading", level: "name", text: "" },
    { id: "title", type: "heading", level: "title", text: "" },
    { id: "company", type: "heading", level: "company", text: "" },
    { id: "phone", type: "contact_row", label: "Phone", valueField: "phone" },
    { id: "email", type: "contact_row", label: "Email", valueField: "email" },
    {
      id: "disclaimer",
      type: "disclaimer",
      text: "This message may contain confidential information intended only for the recipient.",
    },
    { id: "footer", type: "footer_link", label: "", url: "" },
  ],
};

const socialHeavy: SignatureTemplateDefinition = {
  id: "social-heavy",
  name: "Social Heavy",
  description: "C4 sidebar with logo, social pill links, and contact rows.",
  category: "Social",
  canvasWidth: 500,
  layoutStyle: "social-bar",
  blocks: [
    { id: "logo", type: "logo", src: "", width: 120, height: 40, align: "left" },
    { id: "name", type: "heading", level: "name", text: "" },
    { id: "title", type: "heading", level: "title", text: "" },
    { id: "company", type: "heading", level: "company", text: "" },
    {
      id: "social",
      type: "social",
      items: [
        { network: "Website", url: "" },
        { network: "Instagram", url: "" },
        { network: "Facebook", url: "" },
      ],
    },
    { id: "email", type: "contact_row", label: "Email", valueField: "email" },
    { id: "phone", type: "contact_row", label: "Phone", valueField: "phone" },
    { id: "footer", type: "footer_link", label: "", url: "" },
  ],
};

export const SIGNATURE_TEMPLATES: SignatureTemplateDefinition[] = [
  corporateClassic,
  corporateMinimal,
  photoSafari,
  compactMobile,
  legalFooter,
  socialHeavy,
];

export const DEFAULT_TEMPLATE_ID = "corporate-classic";
