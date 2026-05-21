/** Normalize values from .env files (quotes, trailing inline comments). */
export function sanitizeEnvValue(raw: string | undefined): string {
  if (!raw) return "";

  let value = raw.trim();

  const commentAt = value.search(/\s+#/);
  if (commentAt >= 0) {
    value = value.slice(0, commentAt).trim();
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  return value;
}
