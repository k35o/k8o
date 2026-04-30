import { db } from '@repo/database';
import { desc, eq } from 'drizzle-orm';
import { cacheLife } from 'next/cache';

export const getReadingListContentData = async () => {
  'use cache';
  cacheLife('minutes');

  const [sources, articles] = await Promise.all([
    db.query.articleSources.findMany({
      orderBy: (articleSources) => [desc(articleSources.updatedAt)],
    }),
    db.query.articles.findMany({
      with: { articleSource: true },
      orderBy: (articles) => [desc(articles.publishedAt)],
    }),
  ]);

  return {
    sources,
    articleItems: articles.map((article) => ({
      id: article.id,
      title: article.title,
      url: article.url,
      publishedAt: article.publishedAt,
      sourceName: article.articleSource.title,
    })),
    feedCount: sources.filter((source) => source.type === 'feed').length,
    articleCount: articles.length,
  };
};

export const getArticleSourceForEdit = async (id: string) => {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) {
    return null;
  }

  return await db.query.articleSources.findFirst({
    where: eq(db._schema.articleSources.id, numericId),
  });
};
