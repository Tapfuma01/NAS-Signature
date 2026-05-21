import "server-only";

import { getAdminSession, isAdminAuthEnabled } from "@/lib/auth/session";
import {
  canAccessOrgSettings,
  canMutateSignatures,
  type AdminRole,
} from "@/lib/auth/roles";

export type AuthGuardResult = { ok: true; role: AdminRole } | { ok: false; message: string };

export async function requireSignatureMutation(): Promise<AuthGuardResult> {
  if (!isAdminAuthEnabled()) return { ok: true, role: "admin" };
  const session = await getAdminSession();
  if (!session) return { ok: false, message: "Unauthorized" };
  if (!canMutateSignatures(session.role)) {
    return { ok: false, message: "You do not have permission to change signatures" };
  }
  return { ok: true, role: session.role };
}

export async function requireOrgSettingsMutation(): Promise<AuthGuardResult> {
  if (!isAdminAuthEnabled()) return { ok: true, role: "admin" };
  const session = await getAdminSession();
  if (!session) return { ok: false, message: "Unauthorized" };
  if (!canAccessOrgSettings(session.role)) {
    return { ok: false, message: "Only administrators can change organization settings" };
  }
  return { ok: true, role: session.role };
}
