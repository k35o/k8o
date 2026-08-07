import 'server-only';
import { getPublicShare, resolveShareEntry } from '../application/share';
import type { PublicShare } from '../application/share';

export const getPublicShareForRoute = (
  slug: string,
): Promise<PublicShare | null> => getPublicShare(slug);

// 公開ページ（/s/[slug]）の iframe 配信 URL を解決する。公開コンテンツなので認証なし。
export const resolveShareEntryForRoute = (
  slug: string,
): Promise<{ url: string } | null> => resolveShareEntry(slug);

export type { PublicShare } from '../application/share';
