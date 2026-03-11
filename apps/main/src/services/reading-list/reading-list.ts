import { db } from '@repo/database';
import { desc } from 'drizzle-orm';

export async function getArticles() {
  'use cache';
  const results = await db.query.articles.findMany({
    with: {
      articleSource: true,
    },
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
