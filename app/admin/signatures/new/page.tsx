import { MemberSignatureWorkspace } from "@/components/admin/member-signature-workspace";
import { getPublicAppUrl } from "@/lib/app-url";
import { getOrganizationSettings } from "@/lib/data";
import { isR2Configured } from "@/lib/r2";
import { getAdminSession } from "@/lib/auth/session";
import { canMutateSignatures, isReadOnlyAdmin } from "@/lib/auth/roles";
import { loadAllTemplates, getTemplateByIdAsync } from "@/lib/templates/store";
import { emptyMemberForm } from "@/types/admin/member-form";
import { organizationRowToOrgBrand } from "@/types/org-brand";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create signature",
};

export default async function NewSignaturePage() {
  const session = await getAdminSession();
  if (session && !canMutateSignatures(session.role)) {
    redirect("/admin");
  }

  const [organization, assetsBaseUrl, templates] = await Promise.all([
    getOrganizationSettings(),
    getPublicAppUrl(),
    loadAllTemplates(),
  ]);

  const org = organizationRowToOrgBrand(organization);
  const defaultTemplateId = organization.default_template_id;
  await getTemplateByIdAsync(defaultTemplateId);
  const templatesById = Object.fromEntries(templates.map((t) => [t.id, t]));

  const initialForm = {
    ...emptyMemberForm,
    templateId: defaultTemplateId,
    targetPlatform: organization.default_target_platform ?? "generic",
  };

  return (
    <div className="-m-6 flex min-h-[calc(100dvh-3.5rem)] flex-col lg:-m-8">
    <MemberSignatureWorkspace
      mode="create"
      initialForm={initialForm}
      org={org}
      templatesById={templatesById}
      defaultTemplateId={defaultTemplateId}
      assetsBaseUrl={assetsBaseUrl}
      readOnly={session ? isReadOnlyAdmin(session.role) : false}
      r2Enabled={isR2Configured()}
    />
    </div>
  );
}
