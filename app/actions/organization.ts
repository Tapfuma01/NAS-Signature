"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { DEFAULT_TEMPLATE_ID, normalizeTemplateId } from "@/lib/templates";
import { TARGET_PLATFORMS, type TargetPlatform } from "@/types/signature-document";
import { requireOrgSettingsMutation } from "@/lib/auth/require-action";

const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Use a 6-digit hex color like #C69C6D");

const targetPlatformSchema = z.enum(
  TARGET_PLATFORMS as unknown as [TargetPlatform, ...TargetPlatform[]],
);

const orgSettingsInput = z.object({
  companyName: z.string().min(1).max(200),
  footerUrl: z.string().min(1).max(500),
  logoUrl: z.string().max(2000).optional().default(""),
  primaryColor: hexColor,
  accentColor: hexColor,
  textColor: hexColor,
  mutedColor: hexColor,
  borderColor: hexColor,
  defaultTemplateId: z.string().max(64).optional().default(DEFAULT_TEMPLATE_ID),
  defaultTargetPlatform: targetPlatformSchema.optional().default("generic"),
});

export type OrgSettingsActionState = { ok: true } | { ok: false; message: string };

export async function updateOrganizationSettings(
  input: z.infer<typeof orgSettingsInput>,
): Promise<OrgSettingsActionState> {
  const auth = await requireOrgSettingsMutation();
  if (!auth.ok) return { ok: false, message: auth.message };

  const parsed = orgSettingsInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const v = parsed.data;
  const sql = getSql();
  try {
    await sql`
      UPDATE organization_settings
      SET
        company_name = ${v.companyName},
        footer_url = ${v.footerUrl},
        logo_url = ${v.logoUrl ?? ""},
        primary_color = ${v.primaryColor},
        accent_color = ${v.accentColor},
        text_color = ${v.textColor},
        muted_color = ${v.mutedColor},
        border_color = ${v.borderColor},
        default_template_id = ${normalizeTemplateId(v.defaultTemplateId)},
        default_target_platform = ${v.defaultTargetPlatform},
        updated_at = now()
      WHERE id = 1
    `;
  } catch {
    return { ok: false, message: "Failed to save organization settings" };
  }
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  return { ok: true };
}
