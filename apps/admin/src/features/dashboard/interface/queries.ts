import { db } from '@repo/database';
import { count, desc, eq, sum } from 'drizzle-orm';
import { cacheLife } from 'next/cache';

export const getDashboardSummary = async () => {
  'use cache';
  cacheLife('minutes');

  const [blogCount, totalViews, articleCount, sourceCount, recentArticles] =
    await Promise.all([
      db
        .select({ value: count() })
        .from(db._schema.blogs)
        .where(eq(db._schema.blogs.published, true))
        .then((r) => r[0]?.value ?? 0),
      db
        .select({ value: sum(db._schema.blogViews.views) })
        .from(db._schema.blogViews)
        .then((r) => Number(r[0]?.value ?? 0)),
      db
        .select({ value: count() })
        .from(db._schema.articles)
        .then((r) => r[0]?.value ?? 0),
      db
        .select({ value: count() })
        .from(db._schema.articleSources)
        .then((r) => r[0]?.value ?? 0),
      db.query.articles.findMany({
        with: { articleSource: true },
        orderBy: (articles) => [desc(articles.publishedAt)],
        limit: 5,
      }),
    ]);

  return {
    blogCount,
    totalViews,
    articleCount,
    sourceCount,
    recentArticles,
  };
};
