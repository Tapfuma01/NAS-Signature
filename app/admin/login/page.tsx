import { redirect } from "next/navigation";

type SearchParams = Promise<{ next?: string }>;

export default async function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const next = params.next?.startsWith("/admin") ? params.next : undefined;
  redirect(next ? `/?next=${encodeURIComponent(next)}` : "/");
}
