import { DEFAULT_TEMPLATE_ID } from "@/lib/templates";
import type { TargetPlatform } from "@/types/signature-document";

export type MemberForm = {
  id?: string;
  slug?: string;
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  whatsapp: string;
  avatarUrl: string;
  templateId: string;
  targetPlatform: TargetPlatform;
};

export const emptyMemberForm: MemberForm = {
  name: "",
  jobTitle: "",
  email: "",
  phone: "",
  whatsapp: "",
  avatarUrl: "",
  templateId: DEFAULT_TEMPLATE_ID,
  targetPlatform: "generic",
};
