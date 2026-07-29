// admin の Server Action から更新されうる DB 由来キャッシュの共通タグ。
// admin 側は /api/revalidate 経由でこのタグを revalidateTag する。
export const DB_CONTENT_CACHE_TAG = 'db-content';

// admin の同期 cron / 手動同期から更新される browser-support データセットのタグ。
// admin 側の sync-browser-support.ts の定数と揃える。
export const BROWSER_SUPPORT_CACHE_TAG = 'browser-support';
