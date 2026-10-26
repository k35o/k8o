import type { RouteContext } from '@k8ordo/framework';

import {
  findBlogMarkdown,
  isPublishedBlog,
} from '@/features/blog/interface/queries';

export async function GET({
  params,
}: RouteContext<'/blog/:slug/article.md'>): Promise<Response> {
  const { slug } = params;

  // ビルドは公開済みの記事でしか呼ばず、200 でなければ止まる。vite dev は paths を読まずに
  // どの slug でも呼ぶので、下書きをここで 404 にする
  const markdown = (await isPublishedBlog(slug))
    ? await findBlogMarkdown(slug)
    : null;
  if (markdown === null) {
    return new Response('Not Found', { status: 404 });
  }

  return new Response(markdown, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
