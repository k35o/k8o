'use client';

import type { HighlightedCode } from '@repo/code-highlight/tokenize';
import { useEffect, useRef, useState } from 'react';

// ハイライト取得の実体（server action）は呼び出し側から渡す。UI コンポーネント側で
// action を直接 import すると、Storybook が @repo/database まで辿ってしまうため。
export type HighlightFn = (
  code: string,
  lang: string,
) => Promise<HighlightedCode | null>;

// コード確定後に一度だけハイライトを取得する（ストリーミング中は往復させない）。
// highlight が null の環境（Storybook 等）ではプレーン表示のまま。
export const useHighlightedCode = (
  code: string | null,
  isStreaming: boolean,
  lang: string,
  highlight: HighlightFn | null,
): HighlightedCode | null => {
  const [state, setState] = useState<{
    code: string;
    data: HighlightedCode;
  } | null>(null);
  // 古い非同期結果で新しいコードを上書きしないための世代カウンタ。
  const requestRef = useRef(0);

  useEffect(() => {
    if (code === null || isStreaming || highlight === null) {
      return;
    }
    if (state?.code === code) {
      return;
    }
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    void (async () => {
      try {
        const data = await highlight(code, lang);
        if (data !== null && requestRef.current === requestId) {
          setState({ code, data });
        }
      } catch {
        // ハイライトは装飾なので、失敗してもプレーン表示で続行する。
      }
    })();
  }, [code, isStreaming, state, lang, highlight]);

  // 不一致（＝取得中）はプレーン表示にさせる。
  return state?.code === code ? state.data : null;
};
