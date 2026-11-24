import { notFound } from '@k8ordo/framework';
import type { PdfDeck } from '@repo/talk-deck/deck';

import {
  findPdfDeck,
  getTalks as _getTalks,
} from '@/features/talks/application/talks';
import { memoizeInBuild } from '@/shared/cache/memoize-in-build';

export { pdfPageSources } from '@/features/talks/application/pdf-deck';

export const getTalks = memoizeInBuild(_getTalks);

// k8o.me にデッキのあるトーク。一覧・sitemap・paths と同じ 1 つの一覧から引く
export const getTalkDecks = async () =>
  (await getTalks()).flatMap((talk) =>
    talk.deck === null ? [] : [{ ...talk, deck: talk.deck }],
  );

export const findTalkDeck = async (slug: string) =>
  (await getTalkDecks()).find((talk) => talk.deck.slug === slug);

export const getTalkDeck = async (slug: string) => {
  const talk = await findTalkDeck(slug);
  if (talk === undefined) {
    notFound();
  }
  return talk;
};

export const getPdfDeck = async (slug: string): Promise<PdfDeck> => {
  const deck = await findPdfDeck(slug);
  if (deck === null) {
    notFound();
  }
  return deck;
};
