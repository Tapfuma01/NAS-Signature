import { notFound } from "next/navigation";
import { TemplateEditorLoader } from "@/components/editor/template-editor-loader";
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
    <TemplateEditorLoader
      template={template}
      org={org}
      assetsBaseUrl={assetsBaseUrl}
      isDefaultTemplate={organization.default_template_id === template.id}
    />
  );
}
