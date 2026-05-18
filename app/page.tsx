import { SignatureWorkspace } from "@/components/signature-workspace";
import { DEFAULT_ORG_BRAND, organizationRowToOrgBrand } from "@/types/org-brand";

export default async function Home() {
  let org = DEFAULT_ORG_BRAND;
  if (process.env.DATABASE_URL) {
    try {
      const { getOrganizationSettings } = await import("@/lib/data");
      org = organizationRowToOrgBrand(await getOrganizationSettings());
    } catch {
      org = DEFAULT_ORG_BRAND;
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SignatureWorkspace org={org} />
    </div>
  );
}
