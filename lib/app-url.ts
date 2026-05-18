import { headers } from "next/headers";

/** Public site URL for share links (no trailing slash). Prefer NEXT_PUBLIC_APP_URL in production. */
export async function getPublicAppUrl(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
  if (env) return env;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return "http://localhost:3000";
}
