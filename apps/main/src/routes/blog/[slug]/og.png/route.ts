import type { RouteContext } from '@k8ordo/framework';

import { OgImage } from '@/components/site/og-image/og-image';
import {
  findBlogContent,
  getBlogOgCode,
} from '@/features/blog/interface/queries';

export async function GET({
  params,
}: RouteContext<'/blog/:slug/og.png'>): Promise<Response> {
  const { slug } = params;
  const blog = await findBlogContent(slug);
  if (blog === null) {
    return new Response('Not Found', { status: 404 });
  }
  return OgImage({
    category: 'Blog',
    title: blog.title,
    code: (await getBlogOgCode(slug)) ?? undefined,
  });
}
