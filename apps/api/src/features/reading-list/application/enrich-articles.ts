import {
  findEnrichTargets,
  updateArticleOgById,
} from '../infrastructure/reading-list-repository';
import { mapWithArticleOg } from './article-og';
import { readingWindowStart } from './reading-window';

const BACKFILL_LIMIT = 50;

export type EnrichResult = {
  enrichedArticles: number;
};

export async function enrichArticleMetadata(): Promise<EnrichResult> {
  const ninetyDaysAgo = readingWindowStart(Date.now()).toISOString();

  const targets = await findEnrichTargets(ninetyDaysAgo, BACKFILL_LIMIT);

  if (targets.length === 0) {
    return { enrichedArticles: 0 };
  }

  const enriched = await mapWithArticleOg(
    targets,
    async (article, og): Promise<boolean> => {
      if (og.imageUrl === null && og.description === null) {
        return false;
      }
      await updateArticleOgById(article.id, og);
      return true;
    },
  );

  return { enrichedArticles: enriched.filter(Boolean).length };
}
