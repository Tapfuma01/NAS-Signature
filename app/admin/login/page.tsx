import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { isAdminAuthEnabled } from "@/lib/auth/session-token";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin login",
};

type SearchParams = Promise<{ next?: string }>;

export default async function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
  if (!isAdminAuthEnabled()) {
    redirect("/admin");
  }

  const session = await getAdminSession();
  if (session) {
    const params = await searchParams;
    redirect(params.next?.startsWith("/admin") ? params.next : "/admin");
  }

  const params = await searchParams;
  const next = params.next?.startsWith("/admin") ? params.next : "/admin";

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <AdminLoginForm next={next} />
    </div>
  );
}
