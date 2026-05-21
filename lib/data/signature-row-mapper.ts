import { parseStoredDocument } from "@/lib/signature-resolve";
import type { SignatureRow } from "@/types/signature-row";

export function mapSignatureRow(
  row: Record<string, unknown>,
  options?: { includeEditToken?: boolean },
): SignatureRow {
  const mapped: SignatureRow = {
    id: String(row.id),
    name: String(row.name),
    job_title: String(row.job_title),
    email: String(row.email),
    phone: String(row.phone ?? ""),
    whatsapp: row.whatsapp != null ? String(row.whatsapp) : null,
    avatar_url: row.avatar_url != null ? String(row.avatar_url) : null,
    template_id: String(row.template_id),
    target_platform: String(row.target_platform ?? "generic") as SignatureRow["target_platform"],
    document: parseStoredDocument(row.document),
    slug: String(row.slug),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
  if (options?.includeEditToken && row.edit_token != null) {
    mapped.edit_token = String(row.edit_token);
  }
  return mapped;
}
