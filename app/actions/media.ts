"use server";

import { revalidatePath } from "next/cache";
import { requireOrgSettingsMutation } from "@/lib/auth/require-action";
import { getSql } from "@/lib/db";
import { requireSignatureMutation } from "@/lib/auth/require-action";
import {
  isR2Configured,
  uploadOrganizationLogoToR2,
  uploadPublicAssetToR2,
  validateLogoFile,
} from "@/lib/r2";

export type MediaActionState =
  | { ok: true; url: string }
  | { ok: false; message: string };

export async function uploadOrganizationLogo(formData: FormData): Promise<MediaActionState> {
  const auth = await requireOrgSettingsMutation();
  if (!auth.ok) return { ok: false, message: auth.message };

  if (!isR2Configured()) {
    return {
      ok: false,
      message:
        "Logo upload is not configured. Set CLOUDFLARE_R2_* variables or paste a public HTTPS logo URL.",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, message: "No file selected" };
  }

  const validated = validateLogoFile(file);
  if (!validated.ok) {
    return { ok: false, message: validated.message };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadOrganizationLogoToR2(buffer, file.type, validated.ext);

    const sql = getSql();
    await sql`
      UPDATE organization_settings
      SET logo_url = ${url}, updated_at = now()
      WHERE id = 1
    `;

    revalidatePath("/admin");
    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");

    return { ok: true, url };
  } catch (err) {
    console.error("uploadOrganizationLogo", err);
    return { ok: false, message: "Upload failed. Check R2 credentials and bucket public access." };
  }
}

export async function clearOrganizationLogo(): Promise<MediaActionState> {
  const auth = await requireOrgSettingsMutation();
  if (!auth.ok) return { ok: false, message: auth.message };

  const sql = getSql();
  await sql`
    UPDATE organization_settings
    SET logo_url = '', updated_at = now()
    WHERE id = 1
  `;

  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");

  return { ok: true, url: "" };
}

/** Upload an image for member avatars or other assets; returns public URL only (no DB write). */
export async function uploadPublicAsset(formData: FormData): Promise<MediaActionState> {
  const auth = await requireSignatureMutation();
  if (!auth.ok) return { ok: false, message: auth.message };

  if (!isR2Configured()) {
    return {
      ok: false,
      message: "Upload is not configured. Set CLOUDFLARE_R2_* variables or paste a public HTTPS URL.",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, message: "No file selected" };
  }

  const validated = validateLogoFile(file);
  if (!validated.ok) {
    return { ok: false, message: validated.message };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadPublicAssetToR2(buffer, file.type, validated.ext, "avatars");
    return { ok: true, url };
  } catch (err) {
    console.error("uploadPublicAsset", err);
    return { ok: false, message: "Upload failed. Check R2 credentials and bucket public access." };
  }
}
