import { AdminShell } from "@/components/admin/admin-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getAdminSession } from "@/lib/auth/session";
import { isAdminAuthEnabled } from "@/lib/auth/session-token";
import type { AdminRole } from "@/lib/auth/roles";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  const role: AdminRole = session?.role ?? "viewer";
  const authEnabled = isAdminAuthEnabled();

  return (
    <TooltipProvider>
      <AdminShell role={role} authEnabled={authEnabled}>
        {children}
      </AdminShell>
    </TooltipProvider>
  );
}
