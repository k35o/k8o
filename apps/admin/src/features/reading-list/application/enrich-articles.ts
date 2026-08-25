import { mapWithConcurrency } from '@repo/helpers/array/map-with-concurrency';
import { NINETY_DAYS_MS } from '@repo/helpers/date/duration';

import { fetchOgMetadata } from '../infrastructure/og-metadata';
import {
  findEnrichTargets,
  updateArticleOgById,
} from '../infrastructure/reading-list-repository';

const OG_CONCURRENCY = 5;
const BACKFILL_LIMIT = 50;

type EnrichResult = {
  enrichedArticles: number;
};

export async function enrichArticleMetadata(): Promise<EnrichResult> {
  const ninetyDaysAgo = new Date(Date.now() - NINETY_DAYS_MS).toISOString();

  const targets = await findEnrichTargets(ninetyDaysAgo, BACKFILL_LIMIT);

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
      await updateArticleOgById(article.id, {
        imageUrl: og.imageUrl ?? null,
        description: og.description ?? null,
      });
      return true;
    },
  );

  return { enrichedArticles: enriched.filter(Boolean).length };
}
