import { codeToTokens } from 'shiki';
import type { BundledLanguage, ThemedToken } from 'shiki';

// 拡張子なしで import する（このファイルは tokenize/theme を deep-import するアプリ側からも
// 型検査される。allowImportingTsExtensions を持たない consumer でも解決できるようにするため）。
import { CODE_SURFACE } from './theme';

export type HighlightedCode = {
  tokens: ThemedToken[][];
  fg: string;
  bg: string;
};

// plastic（暗色）が既定。one-light はアプリのライトテーマに合わせる用。
export type HighlightTheme = 'plastic' | 'one-light';

const FALLBACK_FG = CODE_SURFACE.fg;
const FALLBACK_BG = CODE_SURFACE.bg;

export const highlightCode = async (
  code: string,
  lang: string,
  theme: HighlightTheme = 'plastic',
): Promise<HighlightedCode> => {
  const result = await codeToTokens(code, {
    lang: lang as BundledLanguage,
    theme,
  }).catch(() => codeToTokens(code, { lang: 'text', theme }));

  return {
    tokens: result.tokens,
    fg: result.fg ?? FALLBACK_FG,
    bg: result.bg ?? FALLBACK_BG,
  };
};
