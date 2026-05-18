import { getLayoutStyleConfig } from "@/lib/signature-render/layout-styles/config";
import { compileSidebarLayout } from "@/lib/signature-render/layout-styles/compile-sidebar";
import { compileStackedLayout } from "@/lib/signature-render/layout-styles/compile-stacked";
import type { StyleCompileContext } from "@/lib/signature-render/layout-styles/primitives";
import { getLayoutStyle } from "@/lib/templates";
import type { RenderProfile } from "@/lib/signature-render/profiles/types";
import type { SignatureBlock, SignatureFieldValues, SignatureTheme } from "@/types/signature-document";
import type { TemplateLayoutStyle } from "@/lib/templates/types";

export { getLayoutStyleConfig } from "@/lib/signature-render/layout-styles/config";
export type { LayoutStyleConfig, ContactMode, FooterMode, SocialMode } from "@/lib/signature-render/layout-styles/config";
export type { StyleCompileContext } from "@/lib/signature-render/layout-styles/primitives";

export function buildStyleContext(input: {
  profile: RenderProfile;
  theme: SignatureTheme;
  fields: SignatureFieldValues;
  assetsBaseUrl: string;
  orgLogoUrl: string;
  canvasWidth: number;
  templateId: string;
}): StyleCompileContext {
  const layoutStyle = getLayoutStyle(input.templateId);
  return {
    profile: input.profile,
    theme: input.theme,
    fields: input.fields,
    assetsBaseUrl: input.assetsBaseUrl,
    orgLogoUrl: input.orgLogoUrl,
    canvasWidth: input.canvasWidth,
    layout: getLayoutStyleConfig(layoutStyle),
  };
}

export function compileBlocksWithLayout(
  blocks: SignatureBlock[],
  ctx: StyleCompileContext,
): string {
  if (ctx.layout.useSidebarLayout) {
    return compileSidebarLayout(blocks, ctx);
  }
  return compileStackedLayout(blocks, ctx);
}

export function resolveLayoutStyleFromTemplate(templateId: string): TemplateLayoutStyle {
  return getLayoutStyle(templateId);
}
