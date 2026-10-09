import { db } from '@repo/database';
import { and, count, desc, eq, gte, isNull, lt } from '@repo/database/orm';

export const findFeedSources = () =>
  db.query.articleSources.findMany({
    where: eq(db._schema.articleSources.type, 'feed'),
  });

export const findArticleTitles = () =>
  db.query.articles.findMany({
    columns: { url: true, title: true },
  });

export type NewArticleRow = {
  articleSourceId: number;
  title: string;
  url: string;
  publishedAt: string;
  imageUrl: string | null;
  description: string | null;
};

// Vercel Cron は同じ回を二重に起動し得るため、unique 違反を握って冪等にする
export const insertArticlesIgnoringDuplicates = async (
  rows: NewArticleRow[],
): Promise<void> => {
  await db
    .insert(db._schema.articles)
    .values(rows)
    .onConflictDoNothing({ target: db._schema.articles.url });
};

export const updateArticleTitles = async (
  updates: Array<{ url: string; title: string }>,
): Promise<void> => {
  const now = new Date().toISOString();
  await Promise.all(
    updates.map((update) =>
      db
        .update(db._schema.articles)
        .set({ title: update.title, updatedAt: now })
        .where(eq(db._schema.articles.url, update.url)),
    ),
  );
};

export const findEnrichTargets = (since: string, limit: number) =>
  db.query.articles.findMany({
    columns: { id: true, url: true },
    where: and(
      isNull(db._schema.articles.imageUrl),
      isNull(db._schema.articles.description),
      gte(db._schema.articles.publishedAt, since),
    ),
    limit,
  });

export type SummaryTarget = {
  id: number;
  url: string;
  title: string;
  summaryAttempts: number;
};

export const findSummaryTargets = (
  since: string,
  maxAttempts: number,
  limit: number,
): Promise<SummaryTarget[]> =>
  db.query.articles.findMany({
    columns: { id: true, url: true, title: true, summaryAttempts: true },
    where: and(
      isNull(db._schema.articles.summary),
      lt(db._schema.articles.summaryAttempts, maxAttempts),
      gte(db._schema.articles.publishedAt, since),
    ),
    orderBy: (articles) => [desc(articles.publishedAt)],
    limit,
  });

// 読んだ時点の試行回数と一致するときだけ増やす。Vercel Cron が同じ回を二重に起動し、
// 両方が同じ値を読んだときに、同じ記事を2回生成しない（単純な increment だと両方が
// 予約できる）。先の実行が処理中の記事を後の実行が読んだ場合までは防げない
export const reserveSummaryAttempt = async (
  id: number,
  readAttempts: number,
): Promise<boolean> => {
  const result = await db
    .update(db._schema.articles)
    .set({ summaryAttempts: readAttempts + 1 })
    .where(
      and(
        eq(db._schema.articles.id, id),
        isNull(db._schema.articles.summary),
        eq(db._schema.articles.summaryAttempts, readAttempts),
      ),
    );
  return result.rowsAffected > 0;
};

export const releaseSummaryAttempt = async (
  id: number,
  readAttempts: number,
): Promise<void> => {
  await db
    .update(db._schema.articles)
    .set({ summaryAttempts: readAttempts })
    .where(
      and(
        eq(db._schema.articles.id, id),
        eq(db._schema.articles.summaryAttempts, readAttempts + 1),
      ),
    );
};

export const saveArticleSummary = async (
  id: number,
  summary: string,
): Promise<boolean> => {
  const result = await db
    .update(db._schema.articles)
    .set({ summary })
    .where(
      and(eq(db._schema.articles.id, id), isNull(db._schema.articles.summary)),
    );
  return result.rowsAffected > 0;
};

export type SummaryProgress = {
  unsummarized: number;
  summaryGaveUp: number;
};

export const countSummaryProgress = async (
  since: string,
  maxAttempts: number,
): Promise<SummaryProgress> => {
  const unsummarizedRecently = and(
    isNull(db._schema.articles.summary),
    gte(db._schema.articles.publishedAt, since),
  );
  const [unsummarized, gaveUp] = await Promise.all([
    db
      .select({ value: count() })
      .from(db._schema.articles)
      .where(unsummarizedRecently),
    db
      .select({ value: count() })
      .from(db._schema.articles)
      .where(
        and(
          unsummarizedRecently,
          gte(db._schema.articles.summaryAttempts, maxAttempts),
        ),
      ),
  ]);
  return {
    unsummarized: unsummarized[0]?.value ?? 0,
    summaryGaveUp: gaveUp[0]?.value ?? 0,
  };
};

export const updateArticleOgById = async (
  id: number,
  og: { imageUrl: string | null; description: string | null },
): Promise<void> => {
  await db
    .update(db._schema.articles)
    .set(og)
    .where(eq(db._schema.articles.id, id));
};
