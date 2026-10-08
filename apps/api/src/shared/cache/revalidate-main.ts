import { DB_CONTENT_CACHE_TAG } from '@repo/helpers/cache/main-cache-tags';

// main は別デプロイのため、secret 検証付きの main の /api/revalidate を叩いてタグを無効化する。
// 失敗しても throw せず false を返す: reading-list は翌日の同期で再検証されるので無視でき、
// 失敗が自己回復しない呼び出し元(browser-support 同期)だけが警報を出す。
export async function revalidateMainCache(
  tag: string = DB_CONTENT_CACHE_TAG,
): Promise<boolean> {
  const url = process.env['MAIN_REVALIDATE_URL'];
  const secret = process.env['REVALIDATE_SECRET'];
  if (
    url === undefined ||
    url === '' ||
    secret === undefined ||
    secret === ''
  ) {
    console.warn(
      'MAIN_REVALIDATE_URL / REVALIDATE_SECRET が設定されていないため、mainの再検証をスキップしました',
    );
    return false;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tag }),
      // main が無応答でも同期を Vercel 関数のタイムアウトまで巻き込まない
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`mainの再検証に失敗しました: ${res.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('mainの再検証に失敗しました:', error);
    return false;
  }
}
