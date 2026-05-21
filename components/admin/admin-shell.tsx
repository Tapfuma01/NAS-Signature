"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ExternalLink,
  LayoutTemplate,
  LogOut,
  Users,
} from "lucide-react";
import { adminLogout } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  canAccessOrgSettings,
  type AdminRole,
} from "@/lib/auth/roles";

type Props = {
  children: React.ReactNode;
  role: AdminRole;
  authEnabled: boolean;
};

const NAV: {
  href: string;
  label: string;
  icon: typeof Users;
  exact?: boolean;
  adminOnly?: boolean;
}[] = [
  { href: "/admin", label: "Signatures", icon: Users, exact: true },
  { href: "/admin/settings", label: "Organization", icon: Building2, adminOnly: true },
];

function isAuthRoute(pathname: string) {
  return pathname === "/admin/login" || pathname === "/admin/forbidden";
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const editMatch = pathname.match(/^\/admin\/signatures\/([^/]+)\/edit$/);
  if (!editMatch) return null;
  return (
    <nav className="text-muted-foreground mb-4 flex items-center gap-2 text-sm">
      <Link href="/admin" className="hover:text-foreground">
        Signatures
      </Link>
      <span aria-hidden>/</span>
      <span className="text-foreground font-medium">Design</span>
    </nav>
  );
}

export function AdminShell({ children, role, authEnabled }: Props) {
  const pathname = usePathname() ?? "";

  if (isAuthRoute(pathname)) {
    return <>{children}</>;
  }

  const showOrgNav = canAccessOrgSettings(role);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-sidebar-border">
        <SidebarHeader className="border-sidebar-border border-b px-3 py-4">
          <div className="flex items-center gap-2 px-1">
            <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
              <LayoutTemplate className="size-4" />
            </div>
            <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-semibold">C4 Signatures</span>
              <span className="text-muted-foreground truncate text-xs">Admin</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Manage</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.filter((item) => !item.adminOnly || showOrgNav).map((item) => {
                  const active =
                    item.exact ? pathname === item.href : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={item.label}
                        render={<Link href={item.href} />}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Tools</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Generator"
                    render={<Link href="/" target="_blank" rel="noopener noreferrer" />}
                  >
                    <ExternalLink />
                    <span>Generator</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-sidebar-border border-t p-2">
          <div className="flex items-center justify-between gap-2 px-1 group-data-[collapsible=icon]:flex-col">
            <ThemeToggle />
            {authEnabled ? (
              <form action={adminLogout}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon-sm"
                  className="text-sidebar-foreground"
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" />
                </Button>
              </form>
            ) : null}
          </div>
          <div className="mt-2 px-1 group-data-[collapsible=icon]:hidden">
            <Badge variant="secondary" className="text-xs capitalize">
              {role}
            </Badge>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex h-14 items-center gap-3 border-b px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6" />
          <span className="text-muted-foreground hidden text-sm sm:inline">Signature admin</span>
        </header>
        <main className="flex-1 p-6 lg:p-8">
          <Breadcrumb pathname={pathname} />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
