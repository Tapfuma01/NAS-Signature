"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { getTemplateByIdAsync } from "@/lib/templates/store";
import { allocateUniqueSlug } from "@/lib/slug";
import { DEFAULT_TEMPLATE_ID, normalizeTemplateId } from "@/lib/templates";
import { organizationRowToOrgBrand } from "@/types/org-brand";
import type { TargetPlatform } from "@/types/signature-document";
import { TARGET_PLATFORMS } from "@/types/signature-document";
import { getOrganizationSettings } from "@/lib/data";
import { getPublicAppUrl } from "@/lib/app-url";
import { requireSignatureMutation } from "@/lib/auth/require-action";

const targetPlatformSchema = z.enum(
  TARGET_PLATFORMS as unknown as [TargetPlatform, ...TargetPlatform[]],
);

const signatureFields = z.object({
  name: z.string().min(1, "Name is required").max(200),
  jobTitle: z.string().max(200).optional().default(""),
  email: z.string().email().max(320),
  phone: z.string().max(80).optional().default(""),
  whatsapp: z.string().max(500).optional().nullable(),
  avatarUrl: z.string().max(2000).optional().nullable(),
  templateId: z.string().max(64).optional().default(DEFAULT_TEMPLATE_ID),
  targetPlatform: targetPlatformSchema.optional().default("generic"),
});

const createInput = signatureFields;

const updateInput = signatureFields.extend({
  id: z.string().uuid(),
});

export type SignatureActionState =
  | { ok: true; slug?: string }
  | { ok: false; message: string };

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "23505"
  );
}

async function resolvePersistedMeta(
  v: z.infer<typeof signatureFields>,
): Promise<{ templateId: string; targetPlatform: TargetPlatform }> {
  const orgRow = await getOrganizationSettings();
  const templateId = normalizeTemplateId(v.templateId);
  const targetPlatform = v.targetPlatform ?? orgRow.default_target_platform ?? "generic";
  await getTemplateByIdAsync(templateId);
  return { templateId, targetPlatform };
}

export async function createSignature(input: z.infer<typeof createInput>): Promise<SignatureActionState> {
  const auth = await requireSignatureMutation();
  if (!auth.ok) return { ok: false, message: auth.message };

  const parsed = createInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const v = parsed.data;
  const sql = getSql();
  const slug = await allocateUniqueSlug(sql, v.name);
  const { templateId, targetPlatform } = await resolvePersistedMeta(v);
  try {
    const rows = (await sql`
      INSERT INTO signatures (
        name,
        job_title,
        email,
        phone,
        whatsapp,
        avatar_url,
        template_id,
        target_platform,
        document,
        slug,
        updated_at
      )
      VALUES (
        ${v.name},
        ${v.jobTitle},
        ${v.email},
        ${v.phone},
        ${v.whatsapp ?? null},
        ${v.avatarUrl ?? null},
        ${templateId},
        ${targetPlatform},
        NULL,
        ${slug},
        now()
      )
      RETURNING slug
    `) as { slug: string }[];
    revalidatePath("/admin");
    revalidatePath("/", "layout");
    return { ok: true, slug: rows[0]?.slug };
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { ok: false, message: "Slug conflict — try a different name" };
    }
    return { ok: false, message: "Failed to create signature" };
  }
}

export async function updateSignature(input: z.infer<typeof updateInput>): Promise<SignatureActionState> {
  const auth = await requireSignatureMutation();
  if (!auth.ok) return { ok: false, message: auth.message };

  const parsed = updateInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const v = parsed.data;
  const sql = getSql();
  const existing = (await sql`
    SELECT name FROM signatures WHERE id = ${v.id}::uuid LIMIT 1
  `) as { name: string }[];
  if (!existing[0]) {
    return { ok: false, message: "Signature not found" };
  }
  const slug =
    existing[0].name === v.name
      ? ((
          await sql`
            SELECT slug FROM signatures WHERE id = ${v.id}::uuid LIMIT 1
          `
        ) as { slug: string }[])[0]?.slug
      : await allocateUniqueSlug(sql, v.name, v.id);
  if (!slug) {
    return { ok: false, message: "Could not resolve slug" };
  }
  const { templateId, targetPlatform } = await resolvePersistedMeta(v);
  try {
    await sql`
      UPDATE signatures
      SET
        name = ${v.name},
        job_title = ${v.jobTitle},
        email = ${v.email},
        phone = ${v.phone},
        whatsapp = ${v.whatsapp ?? null},
        avatar_url = ${v.avatarUrl ?? null},
        template_id = ${templateId},
        target_platform = ${targetPlatform},
        document = NULL,
        slug = ${slug},
        updated_at = now()
      WHERE id = ${v.id}::uuid
    `;
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { ok: false, message: "Slug conflict — try a different name" };
    }
    return { ok: false, message: "Failed to update signature" };
  }
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  revalidatePath(`/${slug}`);
  return { ok: true, slug };
}

const bulkIdsInput = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
});

const bulkTemplateInput = bulkIdsInput.extend({
  templateId: z.string().max(64),
});

export async function bulkDeleteSignatures(ids: string[]): Promise<SignatureActionState> {
  const auth = await requireSignatureMutation();
  if (!auth.ok) return { ok: false, message: auth.message };

  const parsed = bulkIdsInput.safeParse({ ids });
  if (!parsed.success) {
    return { ok: false, message: "Invalid selection" };
  }

  const sql = getSql();
  for (const id of parsed.data.ids) {
    await sql`DELETE FROM signatures WHERE id = ${id}::uuid`;
  }
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function bulkUpdateTemplate(
  ids: string[],
  templateId: string,
): Promise<SignatureActionState> {
  const auth = await requireSignatureMutation();
  if (!auth.ok) return { ok: false, message: auth.message };

  const parsed = bulkTemplateInput.safeParse({ ids, templateId });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const normalized = normalizeTemplateId(parsed.data.templateId);
  const sql = getSql();
  for (const id of parsed.data.ids) {
    await sql`
      UPDATE signatures
      SET template_id = ${normalized}, document = NULL, updated_at = now()
      WHERE id = ${id}::uuid
    `;
  }
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteSignature(id: string): Promise<SignatureActionState> {
  const auth = await requireSignatureMutation();
  if (!auth.ok) return { ok: false, message: auth.message };

  const idParsed = z.string().uuid().safeParse(id);
  if (!idParsed.success) {
    return { ok: false, message: "Invalid id" };
  }
  const sql = getSql();
  await sql`DELETE FROM signatures WHERE id = ${idParsed.data}::uuid`;
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  return { ok: true };
}
