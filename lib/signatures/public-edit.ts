import "server-only";

import { timingSafeEqual } from "crypto";
import { getSql } from "@/lib/db";
import { mapSignatureRow } from "@/lib/data/signature-row-mapper";
import { getPublicAppUrl } from "@/lib/app-url";
import type { SignatureRow } from "@/types/signature-row";

function tokensMatch(stored: string, provided: string): boolean {
  const a = Buffer.from(stored, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Build the install URL emailed to members (includes edit token). */
export async function buildMemberEditUrl(slug: string, editToken: string): Promise<string> {
  const base = (await getPublicAppUrl()).replace(/\/+$/, "");
  return `${base}/${encodeURIComponent(slug)}?token=${encodeURIComponent(editToken)}`;
}

/**
 * Validates slug + token and returns the signature row if the token matches.
 * Treat the emailed link like a password — slug alone is not enough to edit.
 */
export async function verifyEditToken(slug: string, token: string): Promise<SignatureRow | null> {
  const trimmed = token.trim();
  if (!trimmed || trimmed.length > 128) return null;

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
    WHERE slug = ${slug}
    LIMIT 1
  `) as Record<string, unknown>[];

  const row = rows[0];
  if (!row) return null;

  const stored = String(row.edit_token ?? "");
  if (!stored || !tokensMatch(stored, trimmed)) return null;

  return mapSignatureRow(row);
}
