import 'server-only';
import type { Spec } from '@json-render/core';
import type { HighlightedCode } from '@repo/code-highlight/tokenize';

import { findPublicVersion } from '@/features/artifacts/application/artifact-shares';
import type { ArtifactVersion } from '@/features/artifacts/application/artifacts';
import { isShareSlug } from '@/features/artifacts/application/share-slug';
import { highlightBlocks } from '@/features/highlight/application/highlight';
import {
  getProjectLatest,
  getPublicProjectBySlug,
  setVisibility,
} from '@/features/projects/application/projects';
import {
  deckCodeBlocks,
  parseDeck,
  stripNotes,
} from '@/features/slides/application/parse-deck';

export type PublishedShare = {
  slug: string;
};

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

type ShareSlugKind = 'artifact' | 'legacy';

const LEGACY_SLUG = /^[0-9a-f]{12}$/u;

export const shareSlugKind = (slug: string): ShareSlugKind | null => {
  if (isShareSlug(slug)) {
    return 'artifact';
  }
  if (LEGACY_SLUG.test(slug)) {
    return 'legacy';
  }
  return null;
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

// 公開は「公開フラグ + 公開版 ID」を立てるだけ。spec は DB にあり、
// /s/[slug] が読み出してその場で描画する（ビルドや配信基盤は無い）。
export const publishProject = async (input: {
  userId: string;
  projectId: number;
}): Promise<PublishedShare | null> => {
  // 必要なのは最新版 ID と slug だけなので、会話履歴まで読む getProject は使わない。
  const latest = await getProjectLatest({
    userId: input.userId,
    projectId: input.projectId,
  });
  if (latest === null) {
    return null;
  }
  const ok = await setVisibility({
    userId: input.userId,
    projectId: input.projectId,
    visibility: 'public',
    publishedVersionId: latest.versionId,
  });
  if (!ok) {
    return null;
  }
  return {
    slug: latest.slug,
  };
};

// private にした時点で /s/[slug] は 404 になる。非所有/不存在は setVisibility が
// 所有チェックで false を返す。slug は公開キャッシュのタグ無効化に使うため返す。
export const unpublishProject = async (input: {
  userId: string;
  projectId: number;
}): Promise<PublishedShare | null> => {
  const latest = await getProjectLatest({
    userId: input.userId,
    projectId: input.projectId,
  });
  if (latest === null) {
    return null;
  }
  const ok = await setVisibility({
    userId: input.userId,
    projectId: input.projectId,
    visibility: 'private',
    publishedVersionId: null,
  });
  return ok ? { slug: latest.slug } : null;
};

export const getLegacyPublicShare = async (
  slug: string,
): Promise<PublicShare | null> => {
  const project = await getPublicProjectBySlug(slug);
  if (project === null) {
    return null;
  }
  return { kind: 'ui', title: project.title, spec: project.spec };
};
