export type AdminRole = "admin" | "editor" | "viewer";

export function parseAdminRole(value: string | undefined | null): AdminRole {
  if (value === "editor" || value === "viewer") return value;
  return "admin";
}

export function canAccessOrgSettings(role: AdminRole): boolean {
  return role === "admin";
}

export function canMutateSignatures(role: AdminRole): boolean {
  return role === "admin" || role === "editor";
}

export function canBulkDelete(role: AdminRole): boolean {
  return role === "admin" || role === "editor";
}

export function canUseDesignEditor(role: AdminRole): boolean {
  return role === "admin" || role === "editor";
}

export function isReadOnlyAdmin(role: AdminRole): boolean {
  return role === "viewer";
}
