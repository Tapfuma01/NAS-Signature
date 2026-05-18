import type { SignatureBlock, SignatureDocument } from "@/types/signature-document";

export function reorderBlocks(
  document: SignatureDocument,
  fromIndex: number,
  toIndex: number,
): SignatureDocument {
  if (fromIndex === toIndex) return document;
  const blocks = [...document.blocks];
  const [moved] = blocks.splice(fromIndex, 1);
  if (!moved) return document;
  blocks.splice(toIndex, 0, moved);
  return { ...document, blocks };
}

export function updateBlock(
  document: SignatureDocument,
  blockId: string,
  patch: Partial<SignatureBlock> | SignatureBlock,
): SignatureDocument {
  return {
    ...document,
    blocks: document.blocks.map((b) =>
      b.id === blockId ? ({ ...b, ...patch, id: b.id } as SignatureBlock) : b,
    ),
  };
}

export function removeBlock(document: SignatureDocument, blockId: string): SignatureDocument {
  return {
    ...document,
    blocks: document.blocks.filter((b) => b.id !== blockId),
  };
}

export function insertBlock(
  document: SignatureDocument,
  block: SignatureBlock,
  index?: number,
): SignatureDocument {
  const blocks = [...document.blocks];
  const at = index ?? blocks.length;
  blocks.splice(at, 0, block);
  return { ...document, blocks };
}

export function duplicateBlock(document: SignatureDocument, blockId: string): SignatureDocument {
  const index = document.blocks.findIndex((b) => b.id === blockId);
  if (index < 0) return document;
  const source = document.blocks[index]!;
  const copy = JSON.parse(JSON.stringify(source)) as SignatureBlock;
  copy.id = `${source.id}-copy-${Date.now()}`;
  return insertBlock(document, copy, index + 1);
}
