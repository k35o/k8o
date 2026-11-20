import type { RouteContext } from '@k8ordo/framework';

import { findBlogDemoDocument } from '@/features/blog/interface/queries';

export async function GET({
  params,
}: RouteContext<'/blog/:slug/demos/:demo/document.txt'>): Promise<Response> {
  // ビルドは公開済みの記事の例でしか呼ばない。vite dev は paths を読まずにどの値でも呼ぶので、
  // 下書きの記事と記事に無い例をここで 404 にする
  const document = await findBlogDemoDocument(params.slug, params.demo);
  if (document === null) {
    return new Response('Not Found', { status: 404 });
  }

  // 例の文書は記事が fetch して sandbox の iframe の srcdoc に入れる。HTML として配ると、URL を直に
  // 開いたときに sandbox の外（サイトの origin）で動くので、どの配り方でも動かない型にする
  return new Response(document, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
