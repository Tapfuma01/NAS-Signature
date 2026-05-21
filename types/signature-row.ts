import type { SignatureDocument, TargetPlatform } from "@/types/signature-document";

export type SignatureRow = {
  id: string;
  name: string;
  job_title: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  avatar_url: string | null;
  template_id: string;
  target_platform: TargetPlatform;
  document: SignatureDocument | null;
  slug: string;
  /** Present only for admin/internal queries — never expose on anonymous slug reads. */
  edit_token?: string;
  created_at: string;
  updated_at: string;
};
