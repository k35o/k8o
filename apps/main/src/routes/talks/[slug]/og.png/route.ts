import type { RouteContext } from '@k8ordo/framework';

import { OgImage } from '@/components/site/og-image/og-image';
import { findTalkDeck } from '@/features/talks/interface/queries';

export async function GET({
  params,
}: RouteContext<'/talks/:slug/og.png'>): Promise<Response> {
  const talk = await findTalkDeck(params.slug);
  if (talk === undefined) {
    return new Response('Not Found', { status: 404 });
  }
  return OgImage({ category: 'Talks', title: talk.title });
}
