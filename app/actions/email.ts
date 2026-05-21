"use server";

import { z } from "zod";
import { getSignatureById, getOrganizationSettings } from "@/lib/data";
import { organizationRowToOrgBrand } from "@/types/org-brand";
import { requireSignatureMutation } from "@/lib/auth/require-action";
import { sendSignatureInviteEmail } from "@/lib/brevo/send-signature-invite";

const inputSchema = z.object({
  signatureId: z.string().uuid(),
});

export type EmailActionState = { ok: true } | { ok: false; message: string };

export async function sendSignatureInviteEmailAction(
  input: z.infer<typeof inputSchema>,
): Promise<EmailActionState> {
  const auth = await requireSignatureMutation();
  if (!auth.ok) return { ok: false, message: auth.message };

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid signature" };
  }

  const signature = await getSignatureById(parsed.data.signatureId);
  if (!signature) {
    return { ok: false, message: "Signature not found" };
  }

  const orgRow = await getOrganizationSettings();
  const org = organizationRowToOrgBrand(orgRow);

  return sendSignatureInviteEmail({ signature, org });
}
