import { cacheLife } from 'next/cache';
import { NextResponse } from 'next/server';
import RSS from 'rss';

import { getSlideContents } from '@/features/slides/interface/queries';

import { metadata } from '../layout';

const SLIDES_URL = 'https://k8o.me/slides';

async function generateRssFeed() {
  'use cache';
  cacheLife('max');

  const feed = new RSS({
    title: metadata.title,
    description: metadata.description,
    feed_url: `${SLIDES_URL}/feed.xml`,
    site_url: SLIDES_URL,
    language: 'ja',
  });

  const slides = await getSlideContents();

  for (const slide of slides) {
    feed.item({
      title: slide.title,
      description: slide.description ?? '',
      url: `${SLIDES_URL}/${slide.slug}`,
      date: slide.updatedAt,
      categories: slide.tags.map((tag) => tag),
    });
  }

  return feed.xml();
}

export async function GET() {
  const xml = await generateRssFeed();

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
