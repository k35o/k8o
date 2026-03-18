import { db } from '@repo/database';
import { desc, gte } from 'drizzle-orm';
import { cacheLife } from 'next/cache';

const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;

export async function getArticles() {
  'use cache';
  cacheLife('hours');

  const threeMonthsAgo = new Date(Date.now() - THREE_MONTHS_MS).toISOString();

  const results = await db.query.articles.findMany({
    with: {
      articleSource: true,
    },
    where: gte(db._schema.articles.publishedAt, threeMonthsAgo),
    orderBy: (articles) => [desc(articles.publishedAt)],
  });

  return results.map((article) => ({
    id: article.id,
    title: article.title,
    url: article.url,
    publishedAt: article.publishedAt,
    source: {
      id: article.articleSource.id,
      title: article.articleSource.title,
      siteUrl: article.articleSource.siteUrl,
    },
  }));
}

export async function getArticleSources() {
  'use cache';
  cacheLife('hours');
  const results = await db.query.articleSources.findMany({
    orderBy: (sources) => [sources.title],
  });

  return results.map((source) => ({
    id: source.id,
    title: source.title,
  }));
}
