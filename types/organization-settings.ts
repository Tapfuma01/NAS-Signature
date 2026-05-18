import type { TargetPlatform } from "@/types/signature-document";

export type OrganizationSettings = {
  id: number;
  company_name: string;
  footer_url: string;
  logo_url: string;
  primary_color: string;
  accent_color: string;
  text_color: string;
  muted_color: string;
  border_color: string;
  default_template_id: string;
  default_target_platform: TargetPlatform;
  updated_at: string;
};
