import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';

import { getPublicShare } from '../application/share';
import type { PublicShare } from '../application/share';

// slug 単位の公開キャッシュのタグ。publish/unpublish の action が updateTag する。
export const shareCacheTag = (slug: string): string => `share:${slug}`;

// 公開ページ（/s/[slug]）用。公開コンテンツなので認証なし。
// 公開 spec は publish/unpublish 時にしか変わらないため slug 単位でキャッシュする。
// generateMetadata と本文が同じ取得を2回走らせるのも、ここで1回にまとまる。
export const getPublicShareForRoute = async (
  slug: string,
): Promise<PublicShare | null> => {
  'use cache';
  cacheLife('days');
  cacheTag(shareCacheTag(slug));

  const share = await getPublicShare(slug);
  return share;
};

export type { PublicShare } from '../application/share';
