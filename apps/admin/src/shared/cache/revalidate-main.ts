// main 側の DB 由来キャッシュに付与している共通タグ
// （apps/main/src/shared/cache/cache-tags.ts と揃える）。
const DB_CONTENT_CACHE_TAG = 'db-content';

// main は別デプロイのため revalidatePath では再検証できない。
// secret 検証付きの main の /api/revalidate を叩いてタグを無効化する。
// 失敗しても呼び出し元の Server Action は成功扱いのままにする。
export async function revalidateMainCache(): Promise<void> {
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
    return;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tag: DB_CONTENT_CACHE_TAG }),
      // main が無応答でも Server Action を Vercel 関数タイムアウトまで待たせない
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`mainの再検証に失敗しました: ${res.status}`);
    }
  } catch (error) {
    console.error('mainの再検証に失敗しました:', error);
  }
}
