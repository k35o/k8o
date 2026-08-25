// admin → main のキャッシュ再検証プロトコルのタグ。main 側の 'use cache' が付与し、
// admin が書き込み・同期の成功後に main の /api/revalidate を叩いて無効化する、
// アプリ間の事実上の API 契約。タグ名がずれると revalidate は HTTP 上成功したまま
// 黙って空振りするため、双方がこのモジュールを参照して定義を一箇所にする。

// admin の Server Action / cron から更新されうる DB 由来キャッシュの共通タグ
export const DB_CONTENT_CACHE_TAG = 'db-content';

// 同期 cron / 手動同期から更新される browser-support データセットのタグ
export const BROWSER_SUPPORT_CACHE_TAG = 'browser-support';
