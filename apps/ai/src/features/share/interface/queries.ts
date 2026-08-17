import 'server-only';
import { getPublicShare } from '../application/share';
import type { PublicShare } from '../application/share';

// 公開ページ（/s/[slug]）用。公開コンテンツなので認証なし。
export const getPublicShareForRoute = (
  slug: string,
): Promise<PublicShare | null> => getPublicShare(slug);

export type { PublicShare } from '../application/share';
