import { OrganizationSettingsForm } from "@/components/admin/organization-settings-form";
import { getOrganizationSettings } from "@/lib/data";
import { isR2Configured } from "@/lib/r2";
import { getAdminSession } from "@/lib/auth/session";
import { organizationRowToOrgBrand } from "@/types/org-brand";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Organization",
};

export default async function AdminSettingsPage() {
  const [organizationSettings, session] = await Promise.all([
    getOrganizationSettings(),
    getAdminSession(),
  ]);
  const orgBrand = organizationRowToOrgBrand(organizationSettings);
  const role = session?.role ?? "viewer";

  return (
    <OrganizationSettingsForm
      organizationSettings={organizationSettings}
      orgBrand={orgBrand}
      role={role}
      r2Enabled={isR2Configured()}
    />
  );
}
