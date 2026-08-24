import { NextResponse } from 'next/server';

import { generateLlmsContent } from '@/app/_utils/llms-content';

export async function GET() {
  const content = await generateLlmsContent();

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      // / は Accept で HTML と markdown を出し分けるため、共有キャッシュが
      // Accept をキーに含むよう明示する
      Vary: 'Accept',
    },
  });
}
