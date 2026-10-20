import 'server-only';
import { cacheLife } from 'next/cache';
import { cache } from 'react';

import { findSharedVersionId } from '@/features/artifacts/application/artifact-shares';
import { isShareSlug } from '@/features/artifacts/application/share-slug';

import { getArtifactPublicShare } from '../application/share';
import type { PublicShare } from '../application/share';

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
// 1回の要求の中で1回にまとめる。生成物の公開の形でなければ DB を引かない
export const getPublicShareForRoute = cache(
  async (slug: string): Promise<PublicShare | null> =>
    isShareSlug(slug) ? artifactShareOf(slug) : null,
);

export type { DeckHighlight, PublicShare } from '../application/share';
