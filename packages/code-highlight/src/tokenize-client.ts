import { createHighlighterCore } from '@shikijs/core';
import type { HighlighterCore } from '@shikijs/core';
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript';

// 拡張子なしで import する（tokenize.ts と同じく consumer 側の型検査の都合）。
import { CODE_SURFACE } from './theme';
import type { HighlightedCode, HighlightTheme } from './tokenize';

export type { HighlightedCode, HighlightTheme } from './tokenize';

// ./tokenize (oniguruma) は wasm のコンパイルを伴い、script-src に wasm-unsafe-eval が
// 無い CSP のブラウザでは CompileError になる。クライアントでは wasm 不要の
// JS 正規表現エンジンを使い、言語もクライアントで扱うものだけ静的に束ねる。
// 任意言語をハイライトするサーバー側は引き続き ./tokenize を使う。
let highlighterPromise: Promise<HighlighterCore> | null = null;

const getHighlighter = (): Promise<HighlighterCore> =>
  (highlighterPromise ??= createHighlighterCore({
    themes: [
      import('@shikijs/themes/plastic'),
      import('@shikijs/themes/one-light'),
    ],
    langs: [
      import('@shikijs/langs/ts'),
      import('@shikijs/langs/tsx'),
      import('@shikijs/langs/js'),
      import('@shikijs/langs/jsx'),
    ],
    engine: createJavaScriptRegexEngine(),
  }));

export const highlightCode = async (
  code: string,
  lang: string,
  theme: HighlightTheme = 'plastic',
): Promise<HighlightedCode> => {
  const highlighter = await getHighlighter();
  let result;
  try {
    result = highlighter.codeToTokens(code, { lang, theme });
  } catch {
    result = highlighter.codeToTokens(code, { lang: 'text', theme });
  }
  return {
    tokens: result.tokens,
    fg: result.fg ?? CODE_SURFACE.fg,
    bg: result.bg ?? CODE_SURFACE.bg,
  };
};
