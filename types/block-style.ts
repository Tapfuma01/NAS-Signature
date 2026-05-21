/** Per-block spacing and color overrides applied at render time. */
export type BlockStyle = {
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
};

export const DEFAULT_BLOCK_STYLE: BlockStyle = {};

export function mergeBlockStyle(
  base?: BlockStyle,
  patch?: Partial<BlockStyle>,
): BlockStyle {
  return { ...DEFAULT_BLOCK_STYLE, ...base, ...patch };
}
