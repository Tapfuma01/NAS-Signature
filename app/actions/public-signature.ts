"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { verifyEditToken } from "@/lib/signatures/public-edit";

const publicFieldsSchema = z.object({
  slug: z.string().min(1).max(120),
  token: z.string().min(1).max(128),
  fullName: z.string().min(1, "Name is required").max(200),
  jobTitle: z.string().max(200).optional().default(""),
  email: z.string().email().max(320),
  phone: z.string().max(80).optional().default(""),
  whatsapp: z.string().max(500).optional().nullable(),
});

export type PublicSignatureActionState = { ok: true } | { ok: false; message: string };

/**
 * Token-gated update for members — no admin login.
 * Only name, job title, email, phone, and WhatsApp can be changed.
 */
export async function updateMemberDetailsPublic(
  input: z.infer<typeof publicFieldsSchema>,
): Promise<PublicSignatureActionState> {
  const parsed = publicFieldsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const v = parsed.data;
  const verified = await verifyEditToken(v.slug, v.token);
  if (!verified) {
    return { ok: false, message: "Invalid or expired edit link" };
  }

  const sql = getSql();
  try {
    await sql`
      UPDATE signatures
      SET
        name = ${v.fullName},
        job_title = ${v.jobTitle},
        email = ${v.email},
        phone = ${v.phone},
        whatsapp = ${v.whatsapp ?? null},
        document = NULL,
        updated_at = now()
      WHERE slug = ${v.slug}
        AND edit_token = ${v.token.trim()}
    `;
  } catch {
    return { ok: false, message: "Failed to save your details" };
  }

  revalidatePath(`/${v.slug}`);
  return { ok: true };
}
