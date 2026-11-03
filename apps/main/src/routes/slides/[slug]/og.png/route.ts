import type { RouteContext } from '@k8ordo/framework';

import { OgImage } from '@/components/site/og-image/og-image';
import { findSlideContent } from '@/features/slides/interface/queries';

export async function GET({
  params,
}: RouteContext<'/slides/:slug/og.png'>): Promise<Response> {
  const slide = await findSlideContent(params.slug);
  if (slide === undefined) {
    return new Response('Not Found', { status: 404 });
  }
  return OgImage({ category: 'Slides', title: slide.title });
}
