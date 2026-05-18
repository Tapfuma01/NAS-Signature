import { getSql } from "@/lib/db";
import type { OrganizationSettings } from "@/types/organization-settings";
import type { SignatureRow } from "@/types/signature-row";

export async function getOrganizationSettings(): Promise<OrganizationSettings> {
  const sql = getSql();
  const rows = (await sql`
    SELECT
      id,
      company_name,
      footer_url,
      logo_url,
      primary_color,
      accent_color,
      text_color,
      muted_color,
      border_color,
      updated_at::text AS updated_at
    FROM organization_settings
    WHERE id = 1
    LIMIT 1
  `) as OrganizationSettings[];
  if (!rows[0]) {
    throw new Error("Organization settings row is missing. Run db/migrations/001_init.sql on your Neon database.");
  }
  return rows[0];
}

export async function getAllSignatures(): Promise<SignatureRow[]> {
  const sql = getSql();
  return (await sql`
    SELECT
      id::text AS id,
      name,
      job_title,
      email,
      phone,
      whatsapp,
      avatar_url,
      template_id,
      slug,
      created_at::text AS created_at,
      updated_at::text AS updated_at
    FROM signatures
    ORDER BY name ASC
  `) as SignatureRow[];
}

export async function getSignatureBySlug(
  slug: string,
): Promise<{ signature: SignatureRow; organization: OrganizationSettings } | null> {
  const sql = getSql();
  const sigs = (await sql`
    SELECT
      id::text AS id,
      name,
      job_title,
      email,
      phone,
      whatsapp,
      avatar_url,
      template_id,
      slug,
      created_at::text AS created_at,
      updated_at::text AS updated_at
    FROM signatures
    WHERE slug = ${slug}
    LIMIT 1
  `) as SignatureRow[];
  if (!sigs[0]) return null;
  const organization = await getOrganizationSettings();
  return { signature: sigs[0], organization };
}
