import { NextResponse } from 'next/server';

import {
  findBlogMarkdown,
  isPublishedBlog,
} from '@/features/blog/interface/queries';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const markdown = (await isPublishedBlog(slug))
    ? await findBlogMarkdown(slug)
    : null;
  if (markdown === null) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return new NextResponse(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      // /blog/:slug は Accept で HTML と markdown を出し分けるため、
      // 共有キャッシュが Accept をキーに含むよう明示する
      Vary: 'Accept',
      // CopyMarkdown やエージェントからの再取得を関数実行なしで返せるよう CDN に
      // キャッシュさせる。ただし公開状態で 200 と 404 が変わるのに、この応答には
      // キャッシュタグが無く、CDN から狙って消せない。非公開に戻した記事の本文が
      // 残る時間を抑えるため、数分にとどめる
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300',
    },
  });
}
