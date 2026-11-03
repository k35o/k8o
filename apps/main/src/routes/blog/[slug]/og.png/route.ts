import type { RouteContext } from '@k8ordo/framework';

import { renderBlogOgImage } from '@/components/blog/blog-og-image/blog-og-image';
import { findBlogContent } from '@/features/blog/interface/queries';

export async function GET({
  params,
}: RouteContext<'/blog/:slug/og.png'>): Promise<Response> {
  const { slug } = params;
  if ((await findBlogContent(slug)) === null) {
    return new Response('Not Found', { status: 404 });
  }
  return renderBlogOgImage(slug);
}
