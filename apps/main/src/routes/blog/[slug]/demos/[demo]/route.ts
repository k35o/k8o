import type { RouteContext } from '@k8ordo/framework';

import { findBlogDemoDocument } from '@/features/blog/interface/queries';
import { DEMO_CONTENT_SECURITY_POLICY } from '@/site/security-headers';

export async function GET({
  params,
}: RouteContext<'/blog/:slug/demos/:demo'>): Promise<Response> {
  // ビルドは公開済みの記事の例でしか呼ばない。vite dev は paths を読まずにどの値でも呼ぶので、
  // 下書きの記事と記事に無い例をここで 404 にする
  const document = await findBlogDemoDocument(params.slug, params.demo);
  if (document === null) {
    return new Response('Not Found', { status: 404 });
  }

  return new Response(document, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // framework() の頭の CSP の上に書き、vite dev で例の CSP にする。ビルドは応答をファイルにして
      // この頭を捨てるので、Vercel では vercel-routes.ts の規則が付ける
      'Content-Security-Policy': DEMO_CONTENT_SECURITY_POLICY,
    },
  });
}
