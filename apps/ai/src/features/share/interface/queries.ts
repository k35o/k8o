import 'server-only';
import { getPublicShare, type PublicShare } from '../application/share';
import { readSharedAsset } from '../infrastructure/local-build';

// 公開ページ（/s/[slug]）が読む公開プロジェクト。認証なし。
export const getPublicShareForRoute = (
  slug: string,
): Promise<PublicShare | null> => getPublicShare(slug);

// 配信ルート（/s-assets/[slug]/...）が読むビルド済みアセット。認証なし。
export const getSharedAsset = (
  slug: string,
  segments: readonly string[],
): Promise<{ body: Buffer; contentType: string } | null> =>
  readSharedAsset(slug, segments);

export type { PublicShare };
