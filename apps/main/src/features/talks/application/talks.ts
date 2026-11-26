import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

import { getTalks as readTalks } from '@repo/api/build-data';
import { parsePdfDeck } from '@repo/talk-deck/deck';
import type { PdfDeck } from '@repo/talk-deck/deck';

import { deckMdxPath, pdfDeckPath } from './path';
import { pdfPageSources } from './pdf-deck';

type DeckKind = 'mdx' | 'pdf';

// マニフェストが無いことだけを null にし、壊れたマニフェストはそのまま投げる
export const findPdfDeck = async (slug: string): Promise<PdfDeck | null> => {
  let json: string;
  try {
    json = await readFile(pdfDeckPath(slug), 'utf8');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
  return parsePdfDeck(JSON.parse(json));
};

// slug を持つトークの、k8o.me のデッキの種類。中身（MDX か、PDF から作ったマニフェスト）が無ければ null。
// 本番のビルドは中身の無い slug で止まるので、null になるのはストアを読まない preview と手元
const findDeckKind = async (slug: string | null): Promise<DeckKind | null> => {
  if (slug === null) {
    return null;
  }
  if (existsSync(deckMdxPath(slug))) {
    return 'mdx';
  }
  if ((await findPdfDeck(slug)) !== null) {
    return 'pdf';
  }
  console.warn(
    `トーク "${slug}" のデッキの MDX も PDF のマニフェストも無いため、デッキを出しません`,
  );
  return null;
};

// 一覧に出す表紙。PDF から作ったデッキの 1 ページ目
const findCover = async (
  deck: { slug: string; kind: DeckKind } | null,
): Promise<{
  src: string;
  srcSet: string;
  width: number;
  height: number;
} | null> => {
  if (deck?.kind !== 'pdf') {
    return null;
  }
  const first = (await findPdfDeck(deck.slug))?.pages[0];
  return first === undefined
    ? null
    : {
        ...pdfPageSources(deck.slug, 1),
        width: first.width,
        height: first.height,
      };
};

// api の一覧の並びのまま、トークにデッキの種類・表紙・スライドのリンク先を足す
export const getTalks = async () =>
  Promise.all(
    (await readTalks()).map(async (talk) => {
      const kind = await findDeckKind(talk.slug);
      const deck =
        talk.slug === null || kind === null ? null : { slug: talk.slug, kind };
      return {
        id: talk.id,
        title: talk.title,
        eventUrl: talk.eventUrl,
        eventName: talk.eventName,
        eventDate: talk.eventDate,
        eventLocation: talk.eventLocation,
        blog: talk.blog,
        tags: talk.tags,
        deck,
        cover: await findCover(deck),
        slidesHref: deck === null ? null : `/talks/${deck.slug}`,
      };
    }),
  );
