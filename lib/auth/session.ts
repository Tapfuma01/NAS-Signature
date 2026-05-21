import "server-only";

import { cookies } from "next/headers";
import {
  createSessionToken,
  isAdminAuthEnabled,
  verifySessionToken,
  sessionCookieOptions,
  ADMIN_SESSION_COOKIE,
  type AdminSession,
} from "@/lib/auth/session-token";
import type { AdminRole } from "@/lib/auth/roles";

export {
  createSessionToken,
  isAdminAuthEnabled,
  verifySessionToken,
  sessionCookieOptions,
  ADMIN_SESSION_COOKIE,
  type AdminSession,
};

export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isAdminAuthEnabled()) {
    return { role: "admin", exp: Number.MAX_SAFE_INTEGER };
  }
  const jar = await cookies();
  return verifySessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function requireAdminSession(minRole: AdminRole = "viewer"): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  const order: AdminRole[] = ["viewer", "editor", "admin"];
  if (order.indexOf(session.role) < order.indexOf(minRole)) {
    throw new Error("Forbidden");
  }
  return session;
}
