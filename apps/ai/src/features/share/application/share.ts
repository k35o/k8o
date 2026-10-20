import 'server-only';
import type { Spec } from '@json-render/core';
import type { HighlightedCode } from '@repo/code-highlight/tokenize';

import { findPublicVersion } from '@/features/artifacts/application/artifact-shares';
import type { ArtifactVersion } from '@/features/artifacts/application/artifacts';
import { highlightBlocks } from '@/features/highlight/application/highlight';
import {
  deckCodeBlocks,
  parseDeck,
  stripNotes,
} from '@/features/slides/application/parse-deck';

export type DeckHighlight = {
  lang: string;
  code: string;
  light: HighlightedCode | null;
  dark: HighlightedCode | null;
};

// 公開ページに送るのはタイトルと中身だけにする。生成物の id や版の番号を持たせると、取り消したら URL ごと
// 捨てられるよう slug を生成物の id と分けた意味が崩れる
export type PublicShare =
  | { kind: 'ui'; title: string; spec: Spec }
  | {
      kind: 'slides';
      title: string;
      source: string;
      highlights: DeckHighlight[];
    };

// テーマは閲覧者のブラウザで決まるので、両方のテーマの分を作って送る
const highlightDeck = async (source: string): Promise<DeckHighlight[]> => {
  const blocks = deckCodeBlocks(parseDeck(source));
  const [light, dark] = await Promise.all([
    highlightBlocks(blocks, 'light'),
    highlightBlocks(blocks, 'dark'),
  ]);
  return blocks.map((block, index) => ({
    lang: block.lang,
    code: block.code,
    light: light[index] ?? null,
    dark: dark[index] ?? null,
  }));
};

const publicShareOf = async (
  version: ArtifactVersion,
): Promise<PublicShare> => {
  if (version.kind === 'ui') {
    return { kind: 'ui', title: version.title, spec: version.spec };
  }
  // ノートは画面に出ないと伝えて書かせているので、聞き手向けでない話が入りうる。DeckPreview はクライアントで
  // ノートを分けるので、画面で隠すだけでは送る中身に残る
  const source = stripNotes(version.source);
  return {
    kind: 'slides',
    title: version.title,
    source,
    highlights: await highlightDeck(source),
  };
};

export const getArtifactPublicShare = async (
  versionId: number,
): Promise<PublicShare | null> => {
  const version = await findPublicVersion(versionId);
  return version === null ? null : publicShareOf(version);
};
