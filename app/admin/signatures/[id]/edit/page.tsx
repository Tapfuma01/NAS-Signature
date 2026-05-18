import { notFound } from "next/navigation";
import { SignatureEditor } from "@/components/editor/signature-editor";
import { getPublicAppUrl } from "@/lib/app-url";
import { getOrganizationSettings, getSignatureById } from "@/lib/data";
import { organizationRowToOrgBrand } from "@/types/org-brand";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit signature design",
};

export default async function EditSignaturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [signature, organization, assetsBaseUrl] = await Promise.all([
    getSignatureById(id),
    getOrganizationSettings(),
    getPublicAppUrl(),
  ]);

  if (!signature) notFound();

  const org = organizationRowToOrgBrand(organization);

  return <SignatureEditor signature={signature} org={org} assetsBaseUrl={assetsBaseUrl} />;
}
