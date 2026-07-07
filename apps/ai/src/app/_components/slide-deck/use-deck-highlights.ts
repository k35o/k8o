'use client';

import type { HighlightedCode } from '@repo/code-highlight/tokenize';
import { createContext, useEffect, useRef, useState } from 'react';

import type { HighlightFn } from '@/app/_components/highlighted-code';
import {
  type DeckSlide,
  extractCodeBlocks,
} from '@/features/slides/application/parse-deck';

import { highlightKey } from './deck-slide-view/deck-slide-view';

// コードブロックのハイライト関数（server action）。スタジオ側から注入する。
// 既定は null（Storybook などでは取得せずプレーン表示）。
export const DeckHighlightContext = createContext<HighlightFn | null>(null);

const EMPTY: ReadonlyMap<string, HighlightedCode> = new Map();

// デッキ確定時に全コードブロックのハイライトを一括取得する。スライド単位の
// コンポーネントで都度フェッチしないため、ページ送りや印刷（DeckPrint）でも
// 追加の往復なしに全ブロックへ行き渡る。
export const useDeckHighlights = (
  slides: DeckSlide[],
  isStreaming: boolean,
  highlight: HighlightFn | null,
): ReadonlyMap<string, HighlightedCode> => {
  const [highlights, setHighlights] =
    useState<ReadonlyMap<string, HighlightedCode>>(EMPTY);
  // 取得中・失敗したブロックを何度も再取得しないための試行済みキー。
  const attemptedRef = useRef(new Set<string>());

  useEffect(() => {
    if (isStreaming || highlight === null) {
      return;
    }
    const missing = slides
      .flatMap((slide) => extractCodeBlocks(slide.source))
      .filter(
        (block) =>
          !attemptedRef.current.has(highlightKey(block.lang, block.code)),
      );
    if (missing.length === 0) {
      return;
    }
    for (const block of missing) {
      attemptedRef.current.add(highlightKey(block.lang, block.code));
    }
    // クリーンアップで結果を破棄しない。StrictMode はマウント時に effect を
    // 実行→クリーンアップ→再実行するが、attemptedRef により再実行側はフェッチせず、
    // 1回目の結果を捨てると誰も取得しなくなる。アンマウント後の setState は
    // React 18+ では無害な no-op。キーで引くだけの追記なので古い結果が来ても壊れない。
    void (async () => {
      const entries = await Promise.all(
        missing.map(async (block) => {
          const key = highlightKey(block.lang, block.code);
          try {
            return [key, await highlight(block.code, block.lang)] as const;
          } catch {
            // ハイライトは装飾なので、失敗してもプレーン表示で続行する。
            return [key, null] as const;
          }
        }),
      );
      setHighlights((prev) => {
        const next = new Map(prev);
        for (const [key, data] of entries) {
          if (data !== null) {
            next.set(key, data);
          }
        }
        return next;
      });
    })();
  }, [slides, isStreaming, highlight]);

  return highlights;
};
