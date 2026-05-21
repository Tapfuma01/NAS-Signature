import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access denied",
};

export default function AdminForbiddenPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <h1 className="font-heading text-2xl font-semibold">Access denied</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Your account does not have permission to view this page. Organization settings require an
        administrator role.
      </p>
      <Link href="/admin" className={buttonVariants({ className: "mt-6" })}>
        Back to signatures
      </Link>
    </div>
  );
}
