"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { parseAdminRole } from "@/lib/auth/roles";
import {
  createSessionToken,
  isAdminAuthEnabled,
  sessionCookieOptions,
  ADMIN_SESSION_COOKIE,
} from "@/lib/auth/session-token";
import { checkRateLimit, rateLimitKey } from "@/lib/security/rate-limit";
import { secureCompare } from "@/lib/security/secure-compare";

const loginInput = z.object({
  secret: z.string().min(1),
  next: z.string().optional(),
});

export type AuthActionState = { ok: true } | { ok: false; message: string };

export async function adminLogin(input: z.infer<typeof loginInput>): Promise<AuthActionState> {
  const parsed = loginInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Enter the admin password" };
  }

  const configured = process.env.ADMIN_SECRET?.trim();
  if (!configured) {
    return { ok: false, message: "Admin login is not configured (set ADMIN_SECRET)" };
  }

  const hdrs = await headers();
  const clientIp =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip")?.trim() ||
    "unknown";
  const limit = checkRateLimit(rateLimitKey("admin-login", clientIp), {
    maxAttempts: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!limit.allowed) {
    return {
      ok: false,
      message: `Too many attempts. Try again in ${limit.retryAfterSec} seconds.`,
    };
  }

  if (!secureCompare(parsed.data.secret, configured)) {
    return { ok: false, message: "Invalid password" };
  }

  const role = parseAdminRole(process.env.ADMIN_ROLE);
  const token = createSessionToken(role);
  if (!token) {
    return { ok: false, message: "Could not create session" };
  }

  const jar = await cookies();
  jar.set(sessionCookieOptions(token));

  const next = parsed.data.next?.startsWith("/admin") ? parsed.data.next : "/admin";
  redirect(next);
}

export async function adminLogout(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_SESSION_COOKIE);
  redirect("/");
}

export async function getAdminAuthEnabled(): Promise<boolean> {
  return isAdminAuthEnabled();
}
