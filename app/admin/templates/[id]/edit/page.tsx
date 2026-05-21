import { notFound } from "next/navigation";
import { TemplateEditor } from "@/components/editor/template-editor";
import { getPublicAppUrl } from "@/lib/app-url";
import { getOrganizationSettings } from "@/lib/data";
import { getTemplateByIdAsync } from "@/lib/templates/store";
import { organizationRowToOrgBrand } from "@/types/org-brand";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit template",
};

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [template, organization, assetsBaseUrl] = await Promise.all([
    getTemplateByIdAsync(id).catch(() => null),
    getOrganizationSettings(),
    getPublicAppUrl(),
  ]);

  if (!template) notFound();

  const org = organizationRowToOrgBrand(organization);

  return (
    <TemplateEditor
      template={template}
      org={org}
      assetsBaseUrl={assetsBaseUrl}
      isDefaultTemplate={organization.default_template_id === template.id}
    />
  );
}
