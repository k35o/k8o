// admin の Server Action から更新されうる DB 由来キャッシュの共通タグ。
// admin 側は /api/revalidate 経由でこのタグを revalidateTag する。
export const DB_CONTENT_CACHE_TAG = 'db-content';
