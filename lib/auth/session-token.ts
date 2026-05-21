import { createHmac, timingSafeEqual } from "crypto";
import { parseAdminRole, type AdminRole } from "@/lib/auth/roles";

export const ADMIN_SESSION_COOKIE = "nas_admin_session";
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

export type AdminSession = {
  role: AdminRole;
  exp: number;
};

export function getSessionSecret(): string | null {
  const secret = process.env.ADMIN_SECRET?.trim();
  return secret && secret.length > 0 ? secret : null;
}

export function isAdminAuthEnabled(): boolean {
  if (getSessionSecret()) return true;
  return process.env.NODE_ENV === "production";
}

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(role: AdminRole): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC;
  const payload = JSON.stringify({ role, exp });
  const encoded = Buffer.from(payload, "utf8").toString("base64url");
  const sig = signPayload(encoded, secret);
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): AdminSession | null {
  const secret = getSessionSecret();
  if (!secret || !token) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;
  const expected = signPayload(encoded, secret);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as {
      role?: string;
      exp?: number;
    };
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return { role: parseAdminRole(data.role), exp: data.exp };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(token: string) {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}
