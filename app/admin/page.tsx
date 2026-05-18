import { AdminCommandCenter } from "@/components/admin/admin-command-center";
import { getPublicAppUrl } from "@/lib/app-url";
import { getAllSignatures, getOrganizationSettings } from "@/lib/data";
import { organizationRowToOrgBrand } from "@/types/org-brand";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const [initialSignatures, organizationSettings, publicBaseUrl] = await Promise.all([
    getAllSignatures(),
    getOrganizationSettings(),
    getPublicAppUrl(),
  ]);
  const orgBrand = organizationRowToOrgBrand(organizationSettings);

  return (
    <AdminCommandCenter
      initialSignatures={initialSignatures}
      orgBrand={orgBrand}
      organizationSettings={organizationSettings}
      publicBaseUrl={publicBaseUrl}
    />
  );
}
