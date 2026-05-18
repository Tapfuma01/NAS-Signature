import type { SignatureRow } from "@/types/signature-row";
import type { SignatureFormState } from "@/types/signature";

export function signatureRowToFormState(row: SignatureRow): SignatureFormState {
  return {
    fullName: row.name,
    jobTitle: row.job_title,
    phone: row.phone,
    email: row.email,
    whatsapp: row.whatsapp ?? "",
  };
}
