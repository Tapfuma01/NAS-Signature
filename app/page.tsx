import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAdminSession } from "@/lib/auth/session";
import { isAdminAuthEnabled } from "@/lib/auth/session-token";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign in",
};

type SearchParams = Promise<{ next?: string }>;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
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
    <div className="flex min-h-screen items-center justify-center p-6">
      <AdminLoginForm next={next} />
    </div>
  );
}
