import { buildRssFeed } from '@repo/helpers/feed/build-rss';

import { getSlideContents } from '@/features/slides/interface/queries';

const SLIDES_URL = 'https://k8o.me/slides';

export async function GET(): Promise<Response> {
  const slides = await getSlideContents();
  const xml = buildRssFeed({
    title: 'k8o Slides',
    description: '登壇や発表で使ったスライドをまとめています。',
    feedUrl: `${SLIDES_URL}/feed`,
    siteUrl: SLIDES_URL,
    items: slides.map((slide) => ({
      title: slide.title,
      description: slide.description ?? '',
      url: `${SLIDES_URL}/${slide.slug}`,
      guid: `${SLIDES_URL}/${slide.slug}`,
      date: slide.createdAt,
      categories: slide.tags,
    })),
  });

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
