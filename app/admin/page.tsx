import { Suspense } from "react";
import { SignaturesPanel } from "@/components/admin/signatures-panel";
import { getPublicAppUrl } from "@/lib/app-url";
import { getOrganizationSettings, getSignaturesPaginated } from "@/lib/data";
import { getAdminSession } from "@/lib/auth/session";
import { organizationRowToOrgBrand } from "@/types/org-brand";
import { DEFAULT_TEMPLATE_ID } from "@/lib/templates";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Signatures",
};

type SearchParams = Promise<{ page?: string; pageSize?: string; q?: string }>;

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(50, Math.max(10, Number(params.pageSize) || 25));
  const q = (params.q ?? "").trim();

  const [paginated, organizationSettings, publicBaseUrl, session] = await Promise.all([
    getSignaturesPaginated({ page, pageSize, search: q }),
    getOrganizationSettings(),
    getPublicAppUrl(),
    getAdminSession(),
  ]);

  const orgBrand = organizationRowToOrgBrand(organizationSettings);
  const role = session?.role ?? "viewer";

  return (
    <Suspense fallback={<div className="text-muted-foreground text-sm">Loading signatures…</div>}>
      <SignaturesPanel
        rows={paginated.rows}
        total={paginated.total}
        page={paginated.page}
        pageSize={paginated.pageSize}
        searchQuery={q}
        orgBrand={orgBrand}
        organizationDefaults={{
          templateId: organizationSettings.default_template_id ?? DEFAULT_TEMPLATE_ID,
        }}
        publicBaseUrl={publicBaseUrl}
        role={role}
      />
    </Suspense>
  );
}
