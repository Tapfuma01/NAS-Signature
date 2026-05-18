import type { RenderProfile } from "@/lib/signature-render/profiles/types";
import {
  buildStyleContext,
  compileBlocksWithLayout,
} from "@/lib/signature-render/layout-styles";
import type { SignatureBlock, SignatureFieldValues, SignatureTheme } from "@/types/signature-document";

export type CompileContext = {
  profile: RenderProfile;
  theme: SignatureTheme;
  fields: SignatureFieldValues;
  assetsBaseUrl: string;
  orgLogoUrl: string;
  canvasWidth: number;
  templateId: string;
};

export function compileBlocksToRows(blocks: SignatureBlock[], ctx: CompileContext): string {
  const styleCtx = buildStyleContext({
    profile: ctx.profile,
    theme: ctx.theme,
    fields: ctx.fields,
    assetsBaseUrl: ctx.assetsBaseUrl,
    orgLogoUrl: ctx.orgLogoUrl,
    canvasWidth: ctx.canvasWidth,
    templateId: ctx.templateId,
  });
  return compileBlocksWithLayout(blocks, styleCtx);
}
