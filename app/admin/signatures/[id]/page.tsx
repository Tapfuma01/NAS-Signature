import { notFound } from "next/navigation";
import { MemberSignatureWorkspace } from "@/components/admin/member-signature-workspace";
import { getPublicAppUrl } from "@/lib/app-url";
import { getOrganizationSettings, getSignatureById } from "@/lib/data";
import { isR2Configured } from "@/lib/r2";
import { getAdminSession } from "@/lib/auth/session";
import { isReadOnlyAdmin } from "@/lib/auth/roles";
import { loadAllTemplates, getTemplateByIdAsync } from "@/lib/templates/store";
import type { MemberForm } from "@/types/admin/member-form";
import { organizationRowToOrgBrand } from "@/types/org-brand";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit member",
};

export default async function EditSignatureMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [signature, organization, assetsBaseUrl, session, templates] = await Promise.all([
    getSignatureById(id),
    getOrganizationSettings(),
    getPublicAppUrl(),
    getAdminSession(),
    loadAllTemplates(),
  ]);

  if (!signature) notFound();

  const org = organizationRowToOrgBrand(organization);
  const defaultTemplateId = organization.default_template_id;
  await getTemplateByIdAsync(signature.template_id);
  const templatesById = Object.fromEntries(templates.map((t) => [t.id, t]));

  const initialForm: MemberForm = {
    id: signature.id,
    slug: signature.slug,
    name: signature.name,
    jobTitle: signature.job_title,
    email: signature.email,
    phone: signature.phone,
    whatsapp: signature.whatsapp ?? "",
    customFields: signature.custom_fields ?? {},
    avatarUrl: signature.avatar_url ?? "",
    templateId: signature.template_id,
    targetPlatform: signature.target_platform ?? "generic",
  };

  return (
    <div className="-m-6 flex min-h-[calc(100dvh-3.5rem)] flex-col lg:-m-8">
    <MemberSignatureWorkspace
      mode="edit"
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
