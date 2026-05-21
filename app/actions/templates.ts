"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { requireSignatureMutation } from "@/lib/auth/require-action";
import { normalizeTemplateId } from "@/lib/templates";
import { getTemplateByIdAsync, loadAllTemplates } from "@/lib/templates/store";
import type { SignatureDocument } from "@/types/signature-document";
import { TARGET_PLATFORMS } from "@/types/signature-document";

const documentSchema = z.object({
  version: z.literal(1),
  templateId: z.string(),
  targetPlatform: z.enum(
    TARGET_PLATFORMS as unknown as [typeof TARGET_PLATFORMS[number], ...typeof TARGET_PLATFORMS[number][]],
  ),
  canvasWidth: z.union([z.literal(500), z.literal(600)]),
  blocks: z.array(z.record(z.string(), z.unknown())),
  theme: z.object({
    primaryColor: z.string(),
    accentColor: z.string(),
    textColor: z.string(),
    mutedColor: z.string(),
    borderColor: z.string(),
  }),
});

export type TemplateActionState = { ok: true } | { ok: false; message: string };

export async function saveTemplateDesign(input: {
  templateId: string;
  document: unknown;
}): Promise<TemplateActionState> {
  const auth = await requireSignatureMutation();
  if (!auth.ok) return { ok: false, message: auth.message };

  const templateId = normalizeTemplateId(input.templateId);
  const parsed = documentSchema.safeParse(input.document);
  if (!parsed.success) {
    return { ok: false, message: "Invalid template document" };
  }

  const document = parsed.data as SignatureDocument;
  const existing = await getTemplateByIdAsync(templateId);
  const sql = getSql();

  try {
    await sql`
      UPDATE signature_templates
      SET
        document = ${JSON.stringify({ ...document, templateId })}::jsonb,
        canvas_width = ${document.canvasWidth},
        layout_style = ${existing.layoutStyle},
        updated_at = now()
      WHERE id = ${templateId}
    `;
  } catch {
    return { ok: false, message: "Failed to save template" };
  }

  revalidatePath("/admin/templates");
  revalidatePath(`/admin/templates/${templateId}/edit`);
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function listTemplatesAction() {
  return loadAllTemplates();
}
