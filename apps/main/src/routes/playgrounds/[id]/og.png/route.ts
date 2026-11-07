import type { RouteContext } from '@k8ordo/framework';

import { loadPlaygroundSection } from '@/components/playgrounds/load-section';
import { OgImage } from '@/components/site/og-image/og-image';

export async function GET({
  params,
}: RouteContext<'/playgrounds/:id/og.png'>): Promise<Response> {
  const section = await loadPlaygroundSection(params.id);
  if (section === undefined) {
    return new Response('Not Found', { status: 404 });
  }
  return OgImage({ title: section.title, category: 'Playground' });
}
