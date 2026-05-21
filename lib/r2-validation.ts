const MAX_LOGO_BYTES = 2 * 1024 * 1024;

const ALLOWED_LOGO_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export function validateLogoFile(file: File): { ok: true; ext: string } | { ok: false; message: string } {
  const ext = ALLOWED_LOGO_TYPES[file.type];
  if (!ext) {
    return { ok: false, message: "Use PNG, JPEG, WebP, GIF, or SVG." };
  }
  if (file.size > MAX_LOGO_BYTES) {
    return { ok: false, message: "Logo must be 2 MB or smaller." };
  }
  if (file.size === 0) {
    return { ok: false, message: "File is empty." };
  }
  return { ok: true, ext };
}
