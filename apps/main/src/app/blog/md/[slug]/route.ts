import { NextResponse } from 'next/server';

import { getMarkdown } from '@/features/blog/interface/markdown';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const markdown = await getMarkdown(slug);
    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        // /blog/:slug は Accept で HTML と markdown を出し分けるため、
        // 共有キャッシュが Accept をキーに含むよう明示する
        Vary: 'Accept',
        // 本文はデプロイ時に固定される MDX 由来で、Vercel の CDN キャッシュは
        // デプロイで無効化される。CopyMarkdown やエージェントからの再取得を
        // 関数実行なしで返せるよう CDN にキャッシュさせる
        'Cache-Control':
          'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}
