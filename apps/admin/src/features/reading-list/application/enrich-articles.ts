import { db } from '@repo/database';
import { mapWithConcurrency } from '@repo/helpers/array/map-with-concurrency';
import { and, eq, gte, isNull } from 'drizzle-orm';

import { fetchOgMetadata } from '../infrastructure/og-metadata';

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const OG_CONCURRENCY = 5;
// 1回の実行でバックフィルする最大件数。初回など対象が多いときに
// 大量の外部リクエストを一度に発生させないため上限を設ける
const BACKFILL_LIMIT = 50;

type EnrichResult = {
  enrichedArticles: number;
};

/**
 * OGP 未取得（画像・説明ともに null）の既存記事を対象に、
 * 外部サイトから OGP を取得して保存する。表示対象である 90 日以内の記事に限定し、
 * 1回あたり BACKFILL_LIMIT 件まで処理する（次回以降の実行で残りを順次補完する）。
 */
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
      // 取得できなかった記事は更新せず、次回以降の実行で再試行する
      if (og.image === undefined && og.description === undefined) {
        return false;
      }
      await db
        .update(db._schema.articles)
        .set({
          imageUrl: og.image ?? null,
          description: og.description ?? null,
        })
        .where(eq(db._schema.articles.id, article.id));
      return true;
    },
  );

  return { enrichedArticles: enriched.filter(Boolean).length };
}
