import { resolveExportAssetsBaseUrl } from "@/lib/signature-render/image-url";

/** Base URL for absolute image links when copying signatures (client or server). */
export function getExportAssetsBaseUrl(clientOrigin?: string): string {
  const origin = clientOrigin?.trim().replace(/\/+$/, "") ?? "";
  return resolveExportAssetsBaseUrl(origin);
}
