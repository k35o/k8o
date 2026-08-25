// admin 自身の 'use cache' クエリに付けるデータドメイン単位のタグ。
// クエリは「読んでいるデータ」のタグを列挙し、Server Action は書き込んだ
// ドメインを updateTag する。経路（revalidatePath）の列挙はクロスページの
// 参照（例: タグ名を表示する /blogs・/talks・/slides）を取りこぼすため使わない。
// main 側キャッシュの再検証は revalidate-main.ts（別デプロイ）が担う。
export const BLOGS_CACHE_TAG = 'blogs';
export const TAGS_CACHE_TAG = 'tags';
export const TALKS_CACHE_TAG = 'talks';
export const SLIDES_CACHE_TAG = 'slides';
export const COMMENTS_CACHE_TAG = 'comments';
export const READING_LIST_CACHE_TAG = 'reading-list';
export const NOTIFICATIONS_CACHE_TAG = 'notifications';
export const BROWSER_SUPPORT_CACHE_TAG = 'browser-support';
