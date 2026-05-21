import type { SignatureDocument } from "@/types/signature-document";

/** Fast structural compare for undo history — avoids JSON.stringify on every edit. */
export function documentsEqual(a: SignatureDocument, b: SignatureDocument): boolean {
  if (a === b) return true;
  if (
    a.version !== b.version ||
    a.templateId !== b.templateId ||
    a.targetPlatform !== b.targetPlatform ||
    a.canvasWidth !== b.canvasWidth ||
    a.blocks.length !== b.blocks.length
  ) {
    return false;
  }

  const themeA = a.theme;
  const themeB = b.theme;
  if (
    themeA.primaryColor !== themeB.primaryColor ||
    themeA.accentColor !== themeB.accentColor ||
    themeA.textColor !== themeB.textColor ||
    themeA.mutedColor !== themeB.mutedColor ||
    themeA.borderColor !== themeB.borderColor
  ) {
    return false;
  }

  for (let i = 0; i < a.blocks.length; i++) {
    const blockA = a.blocks[i]!;
    const blockB = b.blocks[i]!;
    if (blockA.id !== blockB.id || blockA.type !== blockB.type) return false;
    if (JSON.stringify(blockA) !== JSON.stringify(blockB)) return false;
  }

  return true;
}
