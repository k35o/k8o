import { db } from '@repo/database';
import { and, eq, isNull, lt } from 'drizzle-orm';

export type ArticleForSummary = {
  id: number;
  url: string;
  summary: string | null;
  summaryAttempts: number;
};

export const findArticleForSummary = (
  id: number,
): Promise<ArticleForSummary | undefined> =>
  db.query.articles.findFirst({
    columns: { id: true, url: true, summary: true, summaryAttempts: true },
    where: eq(db._schema.articles.id, id),
  });

// 条件付き UPDATE で試行回数を予約する。変更できた（= true）リクエストだけが
// 生成に進める。summary 生成済み・試行上限到達なら false。
export const reserveSummaryAttempt = async (
  id: number,
  maxAttempts: number,
): Promise<boolean> => {
  const reserved = await db
    .update(db._schema.articles)
    .set({
      summaryAttempts: db._utils.increment(db._schema.articles.summaryAttempts),
    })
    .where(
      and(
        eq(db._schema.articles.id, id),
        isNull(db._schema.articles.summary),
        lt(db._schema.articles.summaryAttempts, maxAttempts),
      ),
    );
  return reserved.rowsAffected > 0;
};

export const findArticleSummary = async (
  id: number,
): Promise<string | null> => {
  const latest = await db.query.articles.findFirst({
    columns: { summary: true },
    where: eq(db._schema.articles.id, id),
  });
  return latest?.summary ?? null;
};

export const saveArticleSummary = async (
  id: number,
  summary: string,
): Promise<void> => {
  await db
    .update(db._schema.articles)
    .set({ summary })
    .where(eq(db._schema.articles.id, id));
};
