'use client';

import type { HighlightedCode } from '@repo/code-highlight/tokenize';
import { createContext, useContext, useEffect, useState } from 'react';
import type { FC, ReactNode } from 'react';

import type { HighlightFn } from '@/app/_components/highlighted-code';
import { deckCodeBlocks } from '@/features/slides/application/parse-deck';
import type {
  DeckCodeBlock,
  DeckSlide,
} from '@/features/slides/application/parse-deck';

import {
  DeckHighlightsContext,
  highlightKey,
} from './deck-slide-view/deck-slide-view';

// コードブロックのハイライト関数。ログインした画面は server action で、公開ページはサーバーで作っておいた
// ハイライトから取るので、使う画面から注入する。既定は null（Storybook などでは取得せずプレーン表示）。
export const DeckHighlightContext = createContext<HighlightFn | null>(null);

type DeckHighlights = ReadonlyMap<string, HighlightedCode>;

const EMPTY: DeckHighlights = new Map();

// 版を切り替えて戻る・隠れていた会話の画面に戻るといった、同じデッキを描き直すたびに
// server action を往復させないよう、取得した Promise を「注入された関数 → デッキ内容」で
// 引けるようにキャッシュする。関数はテーマ切替で差し替わるので、WeakMap のキーにすると
// 古いテーマぶんは参照が切れた時点で回収される。
const cache = new WeakMap<HighlightFn, Map<string, Promise<DeckHighlights>>>();

const fetchHighlights = async (
  blocks: DeckCodeBlock[],
  highlight: HighlightFn,
): Promise<DeckHighlights> => {
  const highlights = new Map<string, HighlightedCode>();
  try {
    const results = await highlight(
      blocks.map((block) => ({ code: block.code, lang: block.lang })),
    );
    for (const [index, data] of results.entries()) {
      const block = blocks[index];
      if (block !== undefined && data !== null) {
        highlights.set(highlightKey(block.lang, block.code), data);
      }
    }
  } catch {
    // ハイライトは装飾なので、失敗してもプレーン表示で続行する。
  }
  return highlights;
};

const deckHighlights = (
  slides: DeckSlide[],
  highlight: HighlightFn,
): Promise<DeckHighlights> => {
  const blocks = deckCodeBlocks(slides);
  if (blocks.length === 0) {
    return Promise.resolve(EMPTY);
  }
  const deckKey = blocks
    .map((block) => highlightKey(block.lang, block.code))
    .join('\u0000');

  let byDeck = cache.get(highlight);
  if (byDeck === undefined) {
    byDeck = new Map();
    cache.set(highlight, byDeck);
  }
  const cached = byDeck.get(deckKey);
  if (cached !== undefined) {
    return cached;
  }
  const pending = fetchHighlights(blocks, highlight);
  byDeck.set(deckKey, pending);
  return pending;
};

const useDeckHighlights = (
  slides: DeckSlide[],
  highlight: HighlightFn | null,
): DeckHighlights => {
  const [highlights, setHighlights] = useState(EMPTY);
  useEffect(() => {
    if (highlight === null) {
      return;
    }
    const controller = new AbortController();
    void (async () => {
      const next = await deckHighlights(slides, highlight);
      if (!controller.signal.aborted) {
        setHighlights(next);
      }
    })();
    return () => {
      controller.abort();
    };
  }, [slides, highlight]);
  return highlights;
};

/**
 * デッキ内の全コードブロックのハイライトを一括で取得し、配下（DeckPrint 含む）へ
 * 配る。スライド単位で都度取得しないため、ページ送りや印刷でも往復は増えない。
 *
 * server action は呼ばれたその場で App Router の state を更新するので、描画中には呼ばず
 * effect で取得を始める。結果は effect のあとの state にだけ置き、ハイドレーションの描画を
 * サーバーと同じプレーンにする（テーマはブラウザでしか決まらない）。取得のあいだは手元の
 * 結果を出したままにするので、テーマの切り替えでは新しい配色が揃うまで今の配色が残る。
 * 生成中（isStreaming）は内容が確定しておらず、書きかけのコードを取得しても捨てるだけなので
 * 取得しない。
 */
export const DeckHighlightsProvider: FC<{
  slides: DeckSlide[];
  isStreaming: boolean;
  children: ReactNode;
}> = ({ slides, isStreaming, children }) => {
  const highlight = useContext(DeckHighlightContext);
  const target = isStreaming ? null : highlight;
  const highlights = useDeckHighlights(slides, target);
  return (
    <DeckHighlightsContext value={target === null ? EMPTY : highlights}>
      {children}
    </DeckHighlightsContext>
  );
};
