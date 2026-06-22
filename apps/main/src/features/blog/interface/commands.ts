import {
  incrementBlogView as _incrementBlogView,
  incrementBlogViewDaily as _incrementBlogViewDaily,
} from '../application/view';

export async function incrementBlogView(id: number): Promise<void> {
  // UTC 基準の YYYY-MM-DD
  const date = new Date().toISOString().slice(0, 10);

  await Promise.all([
    _incrementBlogView(id),
    // 日次集計は best-effort。累計カウントを巻き込まないよう失敗は握りつぶすが、
    // 未適用マイグレーション等によるサイレントな欠落を検知できるようログは残す。
    Promise.resolve(_incrementBlogViewDaily(id, date)).catch(
      (error: unknown) => {
        console.error('Failed to increment blog view daily:', {
          id,
          date,
          error,
        });
      },
    ),
  ]);
}
