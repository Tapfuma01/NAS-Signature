/**
 * Normalize image URLs for email clients (Gmail, Outlook).
 * Remote images must be absolute HTTPS and publicly reachable — not localhost or relative paths.
 */

function isLocalhostHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]" || h.endsWith(".local");
}

export function isLocalhostImageUrl(url: string): boolean {
  if (!url.trim()) return false;
  try {
    return isLocalhostHostname(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** Prefer NEXT_PUBLIC_APP_URL when the runtime origin is localhost (common in dev copy → Gmail). */
export function resolveExportAssetsBaseUrl(assetsBaseUrl: string): string {
  const base = assetsBaseUrl.trim().replace(/\/+$/, "");
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "") ?? "";
  if (env && (!base || isLocalhostImageUrl(base.startsWith("http") ? base : `https://${base}`))) {
    return env;
  }
  return base;
}

/**
 * Turn org logo paths and relative assets into absolute HTTPS URLs for pasted HTML.
 */
export function toAbsoluteHttpsImageUrl(raw: string, assetsBaseUrl: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const base = resolveExportAssetsBaseUrl(assetsBaseUrl);

  let absolute: string;
  if (/^https?:\/\//i.test(trimmed)) {
    absolute = trimmed;
  } else if (trimmed.startsWith("//")) {
    absolute = `https:${trimmed}`;
  } else if (trimmed.startsWith("/")) {
    if (!base) return trimmed;
    absolute = `${base}${trimmed}`;
  } else if (base) {
    absolute = `${base}/${trimmed.replace(/^\/+/, "")}`;
  } else {
    absolute = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(absolute);
    if (parsed.protocol === "http:") {
      parsed.protocol = "https:";
    }
    return parsed.href;
  } catch {
    return absolute;
  }
}
