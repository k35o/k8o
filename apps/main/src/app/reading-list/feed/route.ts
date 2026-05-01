import { cacheLife } from 'next/cache';
import { NextResponse } from 'next/server';
import RSS from 'rss';

import { getArticles } from '@/features/reading-list/interface/queries';

import { metadata } from '../layout';

const READING_LIST_URL = 'https://k8o.me/reading-list';

async function generateRssFeed() {
  'use cache';
  cacheLife('hours');

  const feed = new RSS({
    title: metadata.title,
    description: metadata.description,
    feed_url: `${READING_LIST_URL}/feed.xml`,
    site_url: READING_LIST_URL,
    language: 'ja',
  });

  const articles = await getArticles();

  for (const article of articles) {
    feed.item({
      title: article.title,
      description: '',
      url: article.url,
      date: article.publishedAt,
      categories: [article.source.title],
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
