import { cacheLife } from 'next/cache';
import { NextResponse } from 'next/server';

import { getSlideContents } from '@/features/slides/interface/queries';
import { buildRssFeed } from '@/shared/feed/build-rss';

import { metadata } from '../layout';

const SLIDES_URL = 'https://k8o.me/slides';

async function generateRssFeed() {
  'use cache';
  cacheLife('max');

  const slides = await getSlideContents();

  return buildRssFeed({
    title: metadata.title,
    description: metadata.description,
    feedUrl: `${SLIDES_URL}/feed`,
    siteUrl: SLIDES_URL,
    items: slides.map((slide) => ({
      title: slide.title,
      description: slide.description ?? '',
      url: `${SLIDES_URL}/${slide.slug}`,
      date: slide.updatedAt,
      categories: slide.tags,
    })),
  });
}

export async function GET() {
  const xml = await generateRssFeed();

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
