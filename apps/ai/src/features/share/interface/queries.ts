import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { cache } from 'react';

import { findSharedVersionId } from '@/features/artifacts/application/artifact-shares';

import {
  getArtifactPublicShare,
  getLegacyPublicShare,
  shareSlugKind,
} from '../application/share';
import type { PublicShare } from '../application/share';

// 旧スタジオの公開の slug 単位のキャッシュのタグ。publish/unpublish の action が updateTag する。
export const shareCacheTag = (slug: string): string => `share:${slug}`;

const legacyShareOf = async (slug: string): Promise<PublicShare | null> => {
  'use cache';
  cacheLife('days');
  cacheTag(shareCacheTag(slug));

  return getLegacyPublicShare(slug);
};

// 版の行は書き換えないので、同じ版の id の中身とハイライトは古くならず、タグで無効化しなくてよい。
// 公開しているかは、slug から版の id を引くところで決まる
const publicVersionOf = async (
  versionId: number,
): Promise<PublicShare | null> => {
  'use cache';
  cacheLife('max');

  return getArtifactPublicShare(versionId);
};

// タグの無効化はインスタンスの中だけで効くので、slug から版の id を引くところはキャッシュせず、
// 取り消しをどのインスタンスでもすぐ効かせる
const artifactShareOf = async (slug: string): Promise<PublicShare | null> => {
  const versionId = await findSharedVersionId(slug);
  return versionId === null ? null : publicVersionOf(versionId);
};

// 公開ページ（/s/[slug]）用。公開コンテンツなので認証なし。generateMetadata と本文の読み取りを、
// 1回の要求の中で1回にまとめる。slug の形で新旧のどちらか一方だけを引き、どちらの形でもなければ DB を引かない
export const getPublicShareForRoute = cache(
  async (slug: string): Promise<PublicShare | null> => {
    switch (shareSlugKind(slug)) {
      case 'artifact':
        return artifactShareOf(slug);
      case 'legacy':
        return legacyShareOf(slug);
      case null:
        return null;
    }
  },
);

export type { DeckHighlight, PublicShare } from '../application/share';
