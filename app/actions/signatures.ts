"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { buildDocumentForSave, parseStoredDocument } from "@/lib/signature-resolve";
import type { SignatureDocument } from "@/types/signature-document";
import { allocateUniqueSlug } from "@/lib/slug";
import { DEFAULT_TEMPLATE_ID, normalizeTemplateId } from "@/lib/templates";
import { organizationRowToOrgBrand } from "@/types/org-brand";
import type { TargetPlatform } from "@/types/signature-document";
import { TARGET_PLATFORMS } from "@/types/signature-document";
import { getOrganizationSettings } from "@/lib/data";
import { getPublicAppUrl } from "@/lib/app-url";

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

async function buildPersistedDocument(
  v: z.infer<typeof signatureFields>,
): Promise<{ documentJson: string; templateId: string; targetPlatform: TargetPlatform }> {
  const orgRow = await getOrganizationSettings();
  const org = organizationRowToOrgBrand(orgRow);
  const member = {
    fullName: v.name,
    jobTitle: v.jobTitle,
    phone: v.phone,
    email: v.email,
    whatsapp: v.whatsapp ?? "",
  };
  let assetsBaseUrl = "";
  try {
    assetsBaseUrl = await getPublicAppUrl();
  } catch {
    assetsBaseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ?? "";
  }
  const templateId = normalizeTemplateId(v.templateId);
  const targetPlatform = v.targetPlatform ?? orgRow.default_target_platform ?? "generic";
  const document = buildDocumentForSave({
    org,
    member,
    templateId,
    targetPlatform,
    assetsBaseUrl,
  });
  return {
    documentJson: JSON.stringify(document),
    templateId,
    targetPlatform,
  };
}

export async function createSignature(input: z.infer<typeof createInput>): Promise<SignatureActionState> {
  const parsed = createInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const v = parsed.data;
  const sql = getSql();
  const slug = await allocateUniqueSlug(sql, v.name);
  const { documentJson, templateId, targetPlatform } = await buildPersistedDocument(v);
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
        ${documentJson}::jsonb,
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
  const { documentJson, templateId, targetPlatform } = await buildPersistedDocument(v);
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
        document = ${documentJson}::jsonb,
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

const saveDesignInput = signatureFields.extend({
  id: z.string().uuid(),
  document: z.unknown(),
});

export async function saveSignatureDesign(
  input: z.infer<typeof saveDesignInput>,
): Promise<SignatureActionState> {
  const parsed = saveDesignInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const v = parsed.data;
  const document = parseStoredDocument(v.document);
  if (!document) {
    return { ok: false, message: "Invalid signature document" };
  }

  const sql = getSql();
  const existing = (await sql`
    SELECT name, slug FROM signatures WHERE id = ${v.id}::uuid LIMIT 1
  `) as { name: string; slug: string }[];
  if (!existing[0]) {
    return { ok: false, message: "Signature not found" };
  }

  const slug =
    existing[0].name === v.name
      ? existing[0].slug
      : await allocateUniqueSlug(sql, v.name, v.id);
  if (!slug) {
    return { ok: false, message: "Could not resolve slug" };
  }

  const persisted: SignatureDocument = {
    ...document,
    templateId: normalizeTemplateId(document.templateId),
    targetPlatform: v.targetPlatform ?? document.targetPlatform ?? "generic",
  };

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
        template_id = ${persisted.templateId},
        target_platform = ${persisted.targetPlatform},
        document = ${JSON.stringify(persisted)}::jsonb,
        slug = ${slug},
        updated_at = now()
      WHERE id = ${v.id}::uuid
    `;
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { ok: false, message: "Slug conflict — try a different name" };
    }
    return { ok: false, message: "Failed to save design" };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/signatures/${v.id}/edit`);
  revalidatePath("/", "layout");
  revalidatePath(`/${slug}`);
  return { ok: true, slug };
}

export async function deleteSignature(id: string): Promise<SignatureActionState> {
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
