'use client';

import { useSearchParams } from 'next/navigation';
import type { FC } from 'react';

import type { Slide } from '@/features/slides/application/split-slides';

import { DeckPresenter } from '../deck-presenter';
import { DeckPrint } from '../deck-print';
import { DeckViewer } from '../deck-viewer';

export const SlideDeck: FC<{
  slug: string;
  title: string;
  slides: Slide[];
  qrUrl: string;
}> = ({ slug, title, slides, qrUrl }) => {
  const searchParams = useSearchParams();
  const isPresenter = searchParams.get('mode') === 'presenter';

  const deck = isPresenter ? (
    <DeckPresenter qrUrl={qrUrl} slides={slides} slug={slug} title={title} />
  ) : (
    <DeckViewer qrUrl={qrUrl} slides={slides} slug={slug} title={title} />
  );

  return (
    <>
      {deck}
      {/* 印刷/PDF用の全スライド描画（画面では非表示） */}
      <DeckPrint slides={slides} />
    </>
  );
};
