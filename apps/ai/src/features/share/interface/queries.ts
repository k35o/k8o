import 'server-only';
import {
  getPublicShare,
  type PublicShare,
  readPublicAsset,
} from '../application/share';

export const getPublicShareForRoute = (
  slug: string,
): Promise<PublicShare | null> => getPublicShare(slug);

// 配信ルート（/s-assets/[slug]/...）が読むアセット。認証なし、現在公開中(DB)の slug のみ配信（fail-closed）。
export const getSharedAsset = (
  slug: string,
  segments: readonly string[],
): Promise<{ body: Buffer; contentType: string } | null> =>
  readPublicAsset(slug, segments);

export type { PublicShare };
