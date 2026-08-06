'use client';

import type { HighlightedCode } from '@repo/code-highlight/tokenize';
import {
  createContext,
  Suspense,
  use,
  useContext,
  useDeferredValue,
} from 'react';
import type { FC, ReactNode } from 'react';

import type { HighlightFn } from '@/app/_components/highlighted-code';
import { extractCodeBlocks } from '@/features/slides/application/parse-deck';
import type {
  DeckCodeBlock,
  DeckSlide,
} from '@/features/slides/application/parse-deck';

import {
  DeckHighlightsContext,
  highlightKey,
} from './deck-slide-view/deck-slide-view';

// コードブロックのハイライト関数（server action）。スタジオ側から注入する。
// 既定は null（Storybook などでは取得せずプレーン表示）。
export const DeckHighlightContext = createContext<HighlightFn | null>(null);

const EMPTY: Promise<ReadonlyMap<string, HighlightedCode>> = Promise.resolve(
  new Map(),
);

// レンダーのたびに新しい Promise を作ると use() が解決しないため、取得済みの
// Promise を「注入された関数 → デッキ内容」で引けるようにキャッシュする。
// 関数はテーマ切替で差し替わるので、WeakMap のキーにすると古いテーマぶんは
// 参照が切れた時点で回収される。
const cache = new WeakMap<
  HighlightFn,
  Map<string, Promise<ReadonlyMap<string, HighlightedCode>>>
>();

const fetchHighlights = async (
  blocks: DeckCodeBlock[],
  highlight: HighlightFn,
): Promise<ReadonlyMap<string, HighlightedCode>> => {
  const entries = await Promise.all(
    blocks.map(async (block) => {
      const key = highlightKey(block.lang, block.code);
      try {
        return [key, await highlight(block.code, block.lang)] as const;
      } catch {
        // ハイライトは装飾なので、失敗してもプレーン表示で続行する。
        return [key, null] as const;
      }
    }),
  );
  const highlights = new Map<string, HighlightedCode>();
  for (const [key, data] of entries) {
    if (data !== null) {
      highlights.set(key, data);
    }
  }
  return highlights;
};

const deckHighlights = (
  slides: DeckSlide[],
  highlight: HighlightFn,
): Promise<ReadonlyMap<string, HighlightedCode>> => {
  const blocks = slides.flatMap((slide) => extractCodeBlocks(slide.source));
  if (blocks.length === 0) {
    return EMPTY;
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

const DeckHighlightsProvider: FC<{
  slides: DeckSlide[];
  highlight: HighlightFn;
  children: ReactNode;
}> = ({ slides, highlight, children }) => (
  <DeckHighlightsContext value={use(deckHighlights(slides, highlight))}>
    {children}
  </DeckHighlightsContext>
);

/**
 * デッキ内の全コードブロックのハイライトを一括で取得し、配下（DeckPrint 含む）へ
 * 配る。スライド単位で都度取得しないため、ページ送りや印刷でも往復は増えない。
 *
 * 初回取得中は children をプレーンのまま見せたいので、fallback にも同じ children を
 * 渡す。生成中（isStreaming）は内容が確定しておらず、書きかけのコードを取得しても
 * 捨てるだけなので取得しない。
 *
 * ハイライト関数はテーマ切替で差し替わる。これは緊急の更新ではないので
 * useDeferredValue に載せ、新しい配色が揃うまで現在の配色を出したままにする
 * （そのまま切り替えると、取得のあいだ fallback のプレーン表示に巻き戻る）。
 */
export const DeckHighlightsBoundary: FC<{
  slides: DeckSlide[];
  isStreaming: boolean;
  children: ReactNode;
}> = ({ slides, isStreaming, children }) => {
  const highlight = useDeferredValue(useContext(DeckHighlightContext));
  if (isStreaming || highlight === null) {
    return children;
  }
  return (
    <Suspense fallback={children}>
      <DeckHighlightsProvider highlight={highlight} slides={slides}>
        {children}
      </DeckHighlightsProvider>
    </Suspense>
  );
};
