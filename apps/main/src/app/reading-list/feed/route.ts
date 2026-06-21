import { cacheLife } from 'next/cache';
import { NextResponse } from 'next/server';

import { getArticles } from '@/features/reading-list/interface/queries';
import { buildRssFeed } from '@/shared/feed/build-rss';

import { metadata } from '../layout';

const READING_LIST_URL = 'https://k8o.me/reading-list';

async function generateRssFeed() {
  'use cache';
  cacheLife('hours');

  const articles = await getArticles();

  return buildRssFeed({
    title: metadata.title,
    description: metadata.description,
    feedUrl: `${READING_LIST_URL}/feed`,
    siteUrl: READING_LIST_URL,
    items: articles.map((article) => ({
      title: article.title,
      // summary は本人ではなく AI が生成した紹介文のため、購読者にも分かるよう明示する。
      // 元記事の description にフォールバックする場合は印を付けない
      description:
        article.summary === null
          ? (article.description ?? '')
          : `【AI要約】${article.summary}`,
      url: article.url,
      date: article.publishedAt,
      categories: [article.source.title],
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
