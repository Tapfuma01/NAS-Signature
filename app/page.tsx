import { SignatureWorkspace } from "@/components/signature-workspace";
import { DEFAULT_TEMPLATE_ID, getTemplateById } from "@/lib/templates";
import { getTemplateByIdAsync } from "@/lib/templates/store";
import { DEFAULT_ORG_BRAND, organizationRowToOrgBrand } from "@/types/org-brand";
import type { TargetPlatform } from "@/types/signature-document";

export default async function Home() {
  let org = DEFAULT_ORG_BRAND;
  let defaultTemplateId = DEFAULT_TEMPLATE_ID;
  let defaultTargetPlatform: TargetPlatform = "generic";
  let template = getTemplateById(DEFAULT_TEMPLATE_ID);

  if (process.env.DATABASE_URL) {
    try {
      const { getOrganizationSettings } = await import("@/lib/data");
      const settings = await getOrganizationSettings();
      org = organizationRowToOrgBrand(settings);
      defaultTemplateId = settings.default_template_id;
      defaultTargetPlatform = settings.default_target_platform;
      template = await getTemplateByIdAsync(defaultTemplateId);
    } catch {
      org = DEFAULT_ORG_BRAND;
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SignatureWorkspace
        org={org}
        template={template}
        defaultTargetPlatform={defaultTargetPlatform}
      />
    </div>
  );
}
