import { type BundledLanguage, codeToTokens, type ThemedToken } from 'shiki';

export type HighlightedCode = {
  tokens: ThemedToken[][];
  fg: string;
  bg: string;
};

const FALLBACK_FG = '#a9b2c3';
const FALLBACK_BG = '#21252b';

/**
 * コードをrehypeプラグインと同じテーマ(plastic)でトークン化する。
 * OGP画像のようにHTMLを介さずトークンを直接描画したい場面で使う。
 */
export const highlightCode = async (
  code: string,
  lang: string,
): Promise<HighlightedCode> => {
  const result = await codeToTokens(code, {
    lang: lang as BundledLanguage,
    theme: 'plastic',
  }).catch(() => codeToTokens(code, { lang: 'text', theme: 'plastic' }));

  return {
    tokens: result.tokens,
    fg: result.fg ?? FALLBACK_FG,
    bg: result.bg ?? FALLBACK_BG,
  };
};
