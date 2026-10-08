import { db } from '@repo/database';
import { and, eq, gte, isNull } from '@repo/database/orm';

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

export const updateArticleOgById = async (
  id: number,
  og: { imageUrl: string | null; description: string | null },
): Promise<void> => {
  await db
    .update(db._schema.articles)
    .set(og)
    .where(eq(db._schema.articles.id, id));
};
