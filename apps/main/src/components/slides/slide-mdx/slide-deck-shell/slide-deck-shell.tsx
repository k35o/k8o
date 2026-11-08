import type { FC, ReactNode } from 'react';

import { splitSlides } from '@/components/slides/split-slides/split-slides';
import { SITE_URL } from '@/shared/site/site-url';

import { SlideDeck } from '../../slide-deck/slide-deck/slide-deck';

const SLIDES_BASE_URL = `${SITE_URL}/slides`;

export const SlideDeckShell: FC<{
  slug: string;
  title: string;
  children: ReactNode;
}> = ({ slug, title, children }) => {
  const slides = splitSlides(children);
  const qrUrl = `${SLIDES_BASE_URL}/${slug}`;
  return <SlideDeck qrUrl={qrUrl} slides={slides} slug={slug} title={title} />;
};
