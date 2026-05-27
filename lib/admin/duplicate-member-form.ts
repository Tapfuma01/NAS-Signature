import type { MemberForm } from "@/types/admin/member-form";
import type { SignatureRow } from "@/types/signature-row";

/** Prefill for creating a new signature from an existing row (no id/slug). */
export function duplicateMemberFormFromSignature(source: SignatureRow): MemberForm {
  return {
    name: `${source.name} (copy)`,
    jobTitle: source.job_title,
    email: source.email,
    phone: source.phone,
    whatsapp: source.whatsapp ?? "",
    customFields: source.custom_fields ?? {},
    avatarUrl: source.avatar_url ?? "",
    templateId: source.template_id,
    targetPlatform: source.target_platform ?? "generic",
  };
}
