import type { LayoutStyleConfig } from "@/lib/signature-render/layout-styles/config";
import type { SignatureBlock } from "@/types/signature-document";

export type DividerWidthPreset = "full" | "short";

export function defaultDividerThickness(variant: "accent" | "line"): number {
  return variant === "accent" ? 3 : 1;
}

export function resolveDividerThickness(
  block: Extract<SignatureBlock, { type: "divider" }>,
): number {
  const variant = block.variant ?? "line";
  const raw = block.thickness ?? defaultDividerThickness(variant);
  return Math.min(24, Math.max(1, Math.round(raw)));
}

/** Resolved width for email table attributes (width attr + inline style). */
export function resolveDividerWidth(
  block: Extract<SignatureBlock, { type: "divider" }>,
  layout: LayoutStyleConfig,
  canvasWidth: number,
): { widthAttr: string; widthStyle: string } {
  if (typeof block.width === "number" && block.width > 0) {
    const px = Math.min(canvasWidth, Math.round(block.width));
    return { widthAttr: String(px), widthStyle: `${px}px` };
  }
  if (block.width === "full") {
    return { widthAttr: "100%", widthStyle: `${canvasWidth}px` };
  }
  if (block.width === "short") {
    return { widthAttr: "80", widthStyle: "80px" };
  }

  const variant = block.variant ?? "line";
  if (variant === "line") {
    return { widthAttr: "100%", widthStyle: `${canvasWidth}px` };
  }

  const useFull = layout.dividerAccentWidth === "full";
  return useFull
    ? { widthAttr: "100%", widthStyle: `${canvasWidth}px` }
    : { widthAttr: "80", widthStyle: "80px" };
}
