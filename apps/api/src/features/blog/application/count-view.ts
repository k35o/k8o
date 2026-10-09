import {
  findPublishedBlogId,
  incrementBlogView,
  incrementBlogViewDaily,
} from '../infrastructure/view-repository';

export type CountViewResult = 'counted' | 'not_found';

export async function countBlogView(slug: string): Promise<CountViewResult> {
  const blogId = await findPublishedBlogId(slug);
  if (blogId === null) {
    return 'not_found';
  }

  const date = new Date().toISOString().slice(0, 10);
  await Promise.all([
    incrementBlogView(blogId),
    // 日次の集計は累計を巻き込まないよう失敗を握りつぶすが、欠落に気づけるようログは残す
    incrementBlogViewDaily(blogId, date).catch((error: unknown) => {
      console.error('日次の閲覧数を増やせませんでした:', {
        blogId,
        date,
        error,
      });
    }),
  ]);
  return 'counted';
}
