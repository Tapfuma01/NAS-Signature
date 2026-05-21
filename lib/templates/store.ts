import { cache } from "react";
import { getSql } from "@/lib/db";
import {
  DEFAULT_TEMPLATE_ID,
  SIGNATURE_TEMPLATES,
  getTemplateById as getCatalogTemplateById,
} from "@/lib/templates/catalog";
import type { SignatureTemplateDefinition } from "@/lib/templates/types";
import type { SignatureDocument } from "@/types/signature-document";

export type SignatureTemplateRecord = SignatureTemplateDefinition & {
  updatedAt?: string;
};

function definitionToDocument(def: SignatureTemplateDefinition): SignatureDocument {
  const theme = {
    primaryColor: "#1a1a1a",
    accentColor: "#b8860b",
    textColor: "#1a1a1a",
    mutedColor: "#6b6b6b",
    borderColor: "#e5e5e5",
    ...def.themeOverrides,
  };
  return {
    version: 1,
    templateId: def.id,
    targetPlatform: "generic",
    canvasWidth: def.canvasWidth,
    blocks: JSON.parse(JSON.stringify(def.blocks)) as SignatureDocument["blocks"],
    theme,
  };
}

async function seedBuiltinTemplates(): Promise<void> {
  const sql = getSql();
  for (const def of SIGNATURE_TEMPLATES) {
    const document = definitionToDocument(def);
    await sql`
      INSERT INTO signature_templates (
        id,
        name,
        description,
        category,
        canvas_width,
        layout_style,
        document,
        is_builtin,
        updated_at
      )
      VALUES (
        ${def.id},
        ${def.name},
        ${def.description},
        ${def.category},
        ${def.canvasWidth},
        ${def.layoutStyle},
        ${JSON.stringify(document)}::jsonb,
        true,
        now()
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

function rowToDefinition(row: Record<string, unknown>): SignatureTemplateRecord {
  const doc = row.document as SignatureDocument;
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description ?? ""),
    category: String(row.category) as SignatureTemplateDefinition["category"],
    canvasWidth: (Number(row.canvas_width) === 600 ? 600 : 500) as 500 | 600,
    layoutStyle: String(row.layout_style) as SignatureTemplateDefinition["layoutStyle"],
    blocks: doc?.blocks ?? [],
    themeOverrides: doc?.theme,
    updatedAt: row.updated_at != null ? String(row.updated_at) : undefined,
  };
}

/** Load all templates from DB (seed builtins on first run). Cached per request. */
export const loadAllTemplates = cache(async (): Promise<SignatureTemplateRecord[]> => {
  try {
    const sql = getSql();
    const count = (await sql`SELECT COUNT(*)::int AS c FROM signature_templates`) as {
      c: number;
    }[];
    if ((count[0]?.c ?? 0) === 0) {
      await seedBuiltinTemplates();
    }
    const rows = (await sql`
      SELECT
        id,
        name,
        description,
        category,
        canvas_width,
        layout_style,
        document,
        updated_at::text AS updated_at
      FROM signature_templates
      ORDER BY name ASC
    `) as Record<string, unknown>[];
    if (rows.length > 0) {
      return rows.map(rowToDefinition);
    }
  } catch {
    // DATABASE_URL missing or table not migrated — fall back to catalog
  }
  return SIGNATURE_TEMPLATES.map((t) => ({ ...t }));
});

export async function getTemplateByIdAsync(
  id: string,
): Promise<SignatureTemplateRecord> {
  const normalized = normalizeTemplateId(id);
  const all = await loadAllTemplates();
  return all.find((t) => t.id === normalized) ?? all[0]!;
}

export async function getTemplateDocument(
  templateId: string,
): Promise<SignatureDocument> {
  const def = await getTemplateByIdAsync(templateId);
  return definitionToDocument(def);
}

export function normalizeTemplateId(id: string | null | undefined): string {
  if (!id || id === "default") return DEFAULT_TEMPLATE_ID;
  const catalog = getCatalogTemplateById(id);
  return catalog.id;
}

/** Sync accessor — uses catalog only (client-safe fallback). */
export function getTemplateById(id: string): SignatureTemplateDefinition {
  return getCatalogTemplateById(normalizeTemplateId(id));
}
