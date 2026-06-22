'use client';

import type { HighlightedCode } from '@repo/code-highlight/tokenize';
import { useEffect, useRef, useState } from 'react';

import { highlightTsx } from '@/features/highlight/interface/actions';

// コードが確定したら（ストリーミング中は除く）サーバアクションでハイライトを取得する。
// import type なので shiki 本体はクライアントバンドルに載らない（型は消える）。
// ストリーミング中は1トークン毎に往復させず、確定後に一度だけハイライトする。
export const useHighlightedCode = (
  code: string | null,
  isStreaming: boolean,
): HighlightedCode | null => {
  const [state, setState] = useState<{
    code: string;
    data: HighlightedCode;
  } | null>(null);
  // 古い非同期結果で新しいコードを上書きしないための世代カウンタ。
  const requestRef = useRef(0);

  useEffect(() => {
    if (code === null || isStreaming) {
      return;
    }
    // 既に同じコードをハイライト済みなら再取得しない。
    if (state?.code === code) {
      return;
    }
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    void (async () => {
      const data = await highlightTsx(code);
      if (data !== null && requestRef.current === requestId) {
        setState({ code, data });
      }
    })();
  }, [code, isStreaming, state]);

  // 現在のコードに対応するハイライトのみ返す（不一致＝取得中はプレーン表示にさせる）。
  return state?.code === code ? state.data : null;
};
