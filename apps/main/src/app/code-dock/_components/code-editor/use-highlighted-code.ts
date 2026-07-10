'use client';

import type * as tokenize from '@repo/code-highlight/tokenize';
import type {
  HighlightedCode,
  HighlightTheme,
} from '@repo/code-highlight/tokenize';
import { useEffect, useRef, useState } from 'react';

import type { LintLanguage } from '@/features/code-dock/interface/types';

// shiki を初期バンドルから外すため、初回利用時に一度だけ動的 import する
let tokenizeModule: Promise<typeof tokenize> | null = null;

const loadTokenize = (): Promise<typeof tokenize> =>
  (tokenizeModule ??= import('@repo/code-highlight/tokenize'));

// 初回ハイライトが失敗/大幅遅延しても、この時間を過ぎたらプレーンで見せる保険
const REVEAL_FALLBACK_MS = 1500;

type HighlightState = {
  code: string;
  language: LintLanguage;
  theme: HighlightTheme;
  data: HighlightedCode;
};

export type HighlightResult = {
  /** 現在の入力・テーマに一致するトークン。再ハイライト中は null (プレーン表示) */
  tokens: HighlightedCode | null;
  /**
   * 初回ハイライトが完了したか (=コードを表示してよいか)。初回ロード時に色が付く
   * 前のプレーンなコードを見せないため、これが false の間は呼び出し側で非表示にする。
   */
  ready: boolean;
};

/**
 * 入力中のコードをクライアントサイドでハイライトする。トークンが現在の入力・
 * テーマと一致するときだけ返し、それ以外は null (プレーン表示) にフォールバックする。
 *
 * 面色 (bg/fg) はこのフックではなく CSS のテーマクラスで与える。SSR では
 * ユーザーのテーマが不明なため、JS で面色を描くとフォールバック色がリロード時に
 * 一瞬見えてしまう。CSS なら next-themes がハイドレーション前に付けるテーマクラスで
 * 初回描画から正しい色になる。
 *
 * useDeferredValue は使わない。textarea を非制御にしたことで入力応答性はネイティブ
 * に保たれており、遅延させるとトークンがプレーンへ戻る時間が伸びてチラつくため。
 */
export const useHighlightedCode = (
  code: string,
  language: LintLanguage,
  theme: HighlightTheme,
): HighlightResult => {
  const [state, setState] = useState<HighlightState | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  // 古い非同期結果で新しい入力を上書きしないための世代カウンタ
  const requestRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, REVEAL_FALLBACK_MS);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    void (async () => {
      try {
        const { highlightCode } = await loadTokenize();
        const data = await highlightCode(code, language, theme);
        if (requestRef.current === requestId) {
          setState({ code, data, language, theme });
        }
      } catch {
        // ハイライトは装飾なので、失敗してもプレーン表示で続行する
      }
    })();
  }, [code, language, theme]);

  const matches =
    state?.code === code &&
    state.language === language &&
    state.theme === theme;

  return {
    tokens: matches ? state.data : null,
    // 一度でもハイライトに成功すれば以降は常に表示 (state は直近結果を保持し続ける)
    ready: state !== null || timedOut,
  };
};
