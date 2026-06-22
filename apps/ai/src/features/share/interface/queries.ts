import 'server-only';
import {
  getPublicShare,
  type PublicShare,
  readPublicAsset,
} from '../application/share';

// 公開ページ（/s/[slug]）が読む公開プロジェクト。認証なし。
export const getPublicShareForRoute = (
  slug: string,
): Promise<PublicShare | null> => getPublicShare(slug);

// 配信ルート（/s-assets/[slug]/...）が読むビルド済みアセット。認証なし。
// 現在公開中(DB)の slug のみ配信する（fail-closed）。
export const getSharedAsset = (
  slug: string,
  segments: readonly string[],
): Promise<{ body: Buffer; contentType: string } | null> =>
  readPublicAsset(slug, segments);

export type { PublicShare };
