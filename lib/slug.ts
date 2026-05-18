import type { NeonQueryFunction } from "@neondatabase/serverless";

const RESERVED = new Set([
  "admin",
  "api",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "manifest.webmanifest",
]);

export function slugifyName(name: string): string {
  const s = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  return s.slice(0, 80) || "member";
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED.has(slug.toLowerCase());
}

type SlugRow = { id: string };

export async function allocateUniqueSlug(
  sql: NeonQueryFunction<false, false>,
  name: string,
  excludeId?: string,
): Promise<string> {
  let base = slugifyName(name);
  if (!base) base = "member";
  if (isReservedSlug(base)) base = `user-${base}`;

  for (let i = 0; i < 200; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const rows = (await sql`
      SELECT id FROM signatures WHERE slug = ${candidate} LIMIT 1
    `) as SlugRow[];
    if (rows.length === 0) return candidate;
    if (excludeId && rows[0]?.id === excludeId) return candidate;
  }

  throw new Error("Could not allocate a unique slug");
}
