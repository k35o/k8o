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
      },
    });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}
