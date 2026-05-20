'use client';

import { useSearchParams } from 'next/navigation';
import type { FC } from 'react';

import type { Slide } from '@/features/slides/application/split-slides';

import { DeckPresenter } from '../deck-presenter';
import { DeckViewer } from '../deck-viewer';

export const SlideDeck: FC<{
  slug: string;
  title: string;
  slides: Slide[];
  qrUrl: string;
}> = ({ slug, title, slides, qrUrl }) => {
  const searchParams = useSearchParams();
  const isPresenter = searchParams.get('mode') === 'presenter';

  if (isPresenter) {
    return (
      <DeckPresenter qrUrl={qrUrl} slides={slides} slug={slug} title={title} />
    );
  }

  return <DeckViewer qrUrl={qrUrl} slides={slides} slug={slug} title={title} />;
};
