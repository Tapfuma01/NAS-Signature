import { cache } from "react";
import { getSql } from "@/lib/db";
import { mapSignatureRow } from "@/lib/data/signature-row-mapper";
import type { OrganizationSettings } from "@/types/organization-settings";
import type { SignatureRow } from "@/types/signature-row";

const SIGNATURE_LIST_COLUMNS = `
  id::text AS id,
  name,
  job_title,
  email,
  phone,
  whatsapp,
  avatar_url,
  template_id,
  target_platform,
  slug,
  created_at::text AS created_at,
  updated_at::text AS updated_at
`;

export const getOrganizationSettings = cache(async (): Promise<OrganizationSettings> => {
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
      default_template_id,
      default_target_platform,
      updated_at::text AS updated_at
    FROM organization_settings
    WHERE id = 1
    LIMIT 1
  `) as OrganizationSettings[];
  if (!rows[0]) {
    throw new Error("Organization settings row is missing. Run db/migrations on your Neon database.");
  }
  return rows[0];
});

export async function getAllSignatures(): Promise<SignatureRow[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT ${sql.unsafe(SIGNATURE_LIST_COLUMNS)}
    FROM signatures
    ORDER BY name ASC
  `) as Record<string, unknown>[];
  return rows.map((row) => mapSignatureRow(row));
}

export type SignaturesPageResult = {
  rows: SignatureRow[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getSignaturesPaginated(input: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<SignaturesPageResult> {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(50, Math.max(10, input.pageSize ?? 25));
  const search = (input.search ?? "").trim();
  const offset = (page - 1) * pageSize;
  const sql = getSql();

  if (search) {
    const pattern = `%${search}%`;
    const countRows = (await sql`
      SELECT COUNT(*)::int AS total
      FROM signatures
      WHERE name ILIKE ${pattern} OR email ILIKE ${pattern}
    `) as { total: number }[];
    const rows = (await sql`
      SELECT ${sql.unsafe(SIGNATURE_LIST_COLUMNS)}
      FROM signatures
      WHERE name ILIKE ${pattern} OR email ILIKE ${pattern}
      ORDER BY name ASC
      LIMIT ${pageSize} OFFSET ${offset}
    `) as Record<string, unknown>[];
    return {
      rows: rows.map((row) => mapSignatureRow(row)),
      total: countRows[0]?.total ?? 0,
      page,
      pageSize,
    };
  }

  const countRows = (await sql`SELECT COUNT(*)::int AS total FROM signatures`) as {
    total: number;
  }[];
  const rows = (await sql`
    SELECT ${sql.unsafe(SIGNATURE_LIST_COLUMNS)}
    FROM signatures
    ORDER BY name ASC
    LIMIT ${pageSize} OFFSET ${offset}
  `) as Record<string, unknown>[];
  return {
    rows: rows.map((row) => mapSignatureRow(row)),
    total: countRows[0]?.total ?? 0,
    page,
    pageSize,
  };
}

export async function getSignatureById(id: string): Promise<SignatureRow | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT
      id::text AS id,
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
      edit_token,
      created_at::text AS created_at,
      updated_at::text AS updated_at
    FROM signatures
    WHERE id = ${id}::uuid
    LIMIT 1
  `) as Record<string, unknown>[];
  if (!rows[0]) return null;
  return mapSignatureRow(rows[0], { includeEditToken: true });
}

export async function getSignatureBySlug(
  slug: string,
): Promise<{ signature: SignatureRow; organization: OrganizationSettings } | null> {
  const sql = getSql();
  const [sigs, organization] = await Promise.all([
    sql`
      SELECT
        id::text AS id,
        name,
        job_title,
        email,
        phone,
        whatsapp,
        avatar_url,
        template_id,
        target_platform,
        slug,
        created_at::text AS created_at,
        updated_at::text AS updated_at
      FROM signatures
      WHERE slug = ${slug}
      LIMIT 1
    ` as Promise<Record<string, unknown>[]>,
    getOrganizationSettings(),
  ]);
  if (!sigs[0]) return null;
  return { signature: mapSignatureRow(sigs[0]), organization };
}
