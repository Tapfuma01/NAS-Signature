import { notFound } from "next/navigation";
import { PublicSignatureWorkspace } from "@/components/public-signature-workspace";
import { getPublicAppUrl } from "@/lib/app-url";
import { getSignatureBySlug } from "@/lib/data";
import { verifyEditToken } from "@/lib/signatures/public-edit";
import { getTemplateByIdAsync } from "@/lib/templates/store";
import { signatureRowToFormState } from "@/lib/signature-map";
import { organizationRowToOrgBrand } from "@/types/org-brand";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ token?: string }>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSignatureBySlug(slug);
  if (!data) return { title: "Signature" };
  return {
    title: `${data.signature.name} · ${data.organization.company_name}`,
    description: `Install your ${data.organization.company_name} email signature.`,
  };
}

export default async function PublicSignaturePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const data = await getSignatureBySlug(slug);
  if (!data) notFound();

  const query = await searchParams;
  const token = query.token?.trim();
  const verified = token ? await verifyEditToken(slug, token) : null;
  const canEdit = Boolean(verified);
  const member = signatureRowToFormState(verified ?? data.signature);

  const org = organizationRowToOrgBrand(data.organization);
  const [assetsBaseUrl, template] = await Promise.all([
    getPublicAppUrl(),
    getTemplateByIdAsync(data.signature.template_id),
  ]);

  return (
    <div className="bg-muted/30 min-h-screen px-4 py-12">
      <div className="mx-auto mb-8 flex max-w-xl flex-col gap-2 text-center">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">{org.companyName}</p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          {member.fullName || data.signature.name}
        </h1>
        <p className="text-muted-foreground text-sm">
          {canEdit
            ? "Update your details, then copy your signature into your email app."
            : "Your email signature is ready. Copy it below — no login required."}
        </p>
      </div>
      <div className="bg-card shadow-soft mx-auto max-w-xl rounded-2xl border p-6 md:p-8">
        <PublicSignatureWorkspace
          org={org}
          initialMember={member}
          assetsBaseUrl={assetsBaseUrl}
          template={template}
          signatureRow={{
            template_id: data.signature.template_id,
            target_platform: data.signature.target_platform,
            slug: data.signature.slug,
          }}
          canEdit={canEdit}
          editToken={canEdit ? token : undefined}
        />
      </div>
    </div>
  );
}
