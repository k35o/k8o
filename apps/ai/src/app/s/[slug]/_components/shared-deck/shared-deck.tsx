'use client';

import { useTheme } from 'next-themes';
import { useMemo } from 'react';
import type { FC } from 'react';

import { DeckPreview } from '@/app/_components/deck-preview';
import type { HighlightFn } from '@/app/_components/highlighted-code';
import {
  DeckHighlightContext,
  highlightKey,
} from '@/app/_components/slide-deck';
import type { DeckHighlight } from '@/features/share/interface/queries';

type SharedDeckProps = {
  source: string;
  highlights: DeckHighlight[];
};

export const SharedDeck: FC<SharedDeckProps> = ({ source, highlights }) => {
  const { resolvedTheme } = useTheme();
  const highlight = useMemo<HighlightFn | null>(() => {
    // テーマが決まる前に渡すと、決まったあとに取り直すことになる
    if (resolvedTheme !== 'light' && resolvedTheme !== 'dark') {
      return null;
    }
    const theme = resolvedTheme;
    const byBlock = new Map(
      highlights.map((entry) => [highlightKey(entry.lang, entry.code), entry]),
    );
    // コードブロックはハイライトのトークンで本文を描くので、並び順で当てると、並びがずれたときに別のブロックの
    // コードが出る。言語とコードで引き、無ければプレーンにする
    return (blocks) =>
      Promise.resolve(
        blocks.map(
          (block) =>
            byBlock.get(highlightKey(block.lang, block.code))?.[theme] ?? null,
        ),
      );
  }, [resolvedTheme, highlights]);
  return (
    <DeckHighlightContext value={highlight}>
      <DeckPreview isStreaming={false} printable source={source} />
    </DeckHighlightContext>
  );
};
