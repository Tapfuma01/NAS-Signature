import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicSignatureClient } from "@/components/public-signature-client";
import { getPublicAppUrl } from "@/lib/app-url";
import { getSignatureBySlug } from "@/lib/data";
import { getTemplateByIdAsync } from "@/lib/templates/store";
import { signatureRowToFormState } from "@/lib/signature-map";
import { organizationRowToOrgBrand } from "@/types/org-brand";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getSignatureBySlug(slug);
  if (!data) notFound();

  const org = organizationRowToOrgBrand(data.organization);
  const member = signatureRowToFormState(data.signature);
  const [assetsBaseUrl, template] = await Promise.all([
    getPublicAppUrl(),
    getTemplateByIdAsync(data.signature.template_id),
  ]);

  return (
    <div className="bg-muted/30 min-h-screen px-4 py-12">
      <div className="mx-auto mb-8 flex max-w-xl flex-col gap-2 text-center">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">{org.companyName}</p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">{data.signature.name}</h1>
        <p className="text-muted-foreground text-sm">
          Your email signature is ready. Copy it below — no login required.
        </p>
        <Link href="/" className="text-primary text-sm font-medium hover:underline">
          Back to generator
        </Link>
      </div>
      <div className="bg-card shadow-soft mx-auto max-w-xl rounded-2xl border p-6 md:p-8">
        <PublicSignatureClient
          org={org}
          member={member}
          assetsBaseUrl={assetsBaseUrl}
          template={template}
          signatureRow={{
            template_id: data.signature.template_id,
            target_platform: data.signature.target_platform,
            slug: data.signature.slug,
          }}
        />
      </div>
    </div>
  );
}
