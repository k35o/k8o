import type { FC, ReactNode } from 'react';

import { splitSlides } from '@/app/slides/_utils/split-slides';

import { SlideDeck } from '../../slide-deck/slide-deck';

const SLIDES_BASE_URL = 'https://k8o.me/slides';

export const SlideDeckShell: FC<{
  slug: string;
  title: string;
  children: ReactNode;
}> = ({ slug, title, children }) => {
  const slides = splitSlides(children);
  const qrUrl = `${SLIDES_BASE_URL}/${slug}`;
  return <SlideDeck qrUrl={qrUrl} slides={slides} slug={slug} title={title} />;
};
