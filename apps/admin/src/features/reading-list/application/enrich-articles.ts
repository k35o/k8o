import { db } from '@repo/database';
import { mapWithConcurrency } from '@repo/helpers/array/map-with-concurrency';
import { NINETY_DAYS_MS } from '@repo/helpers/date/duration';
import { and, eq, gte, isNull } from 'drizzle-orm';

import { fetchOgMetadata } from '../infrastructure/og-metadata';

const OG_CONCURRENCY = 5;
const BACKFILL_LIMIT = 50;

type EnrichResult = {
  enrichedArticles: number;
};

export async function enrichArticleMetadata(): Promise<EnrichResult> {
  const ninetyDaysAgo = new Date(Date.now() - NINETY_DAYS_MS).toISOString();

  const targets = await db.query.articles.findMany({
    columns: { id: true, url: true },
    where: and(
      isNull(db._schema.articles.imageUrl),
      isNull(db._schema.articles.description),
      gte(db._schema.articles.publishedAt, ninetyDaysAgo),
    ),
    limit: BACKFILL_LIMIT,
  });

  if (targets.length === 0) {
    return { enrichedArticles: 0 };
  }

  const enriched = await mapWithConcurrency(
    targets,
    OG_CONCURRENCY,
    async (article): Promise<boolean> => {
      const og = await fetchOgMetadata(article.url);
      if (og.imageUrl === undefined && og.description === undefined) {
        return false;
      }
      await db
        .update(db._schema.articles)
        .set({
          imageUrl: og.imageUrl ?? null,
          description: og.description ?? null,
        })
        .where(eq(db._schema.articles.id, article.id));
      return true;
    },
  );

  return { enrichedArticles: enriched.filter(Boolean).length };
}
