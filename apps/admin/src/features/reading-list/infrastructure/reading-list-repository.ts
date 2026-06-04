import { db } from '@repo/database';
import {
  ARTICLE_SOURCE_TYPES,
  type ArticleSourceType,
} from '@repo/database/schema';
import { desc, eq } from 'drizzle-orm';

// interface 層は @repo/database を直接参照しないため、ドメイン定義をここで中継する
export { ARTICLE_SOURCE_TYPES, type ArticleSourceType };

export const findReadingListContent = async () => {
  const [sources, articles] = await Promise.all([
    db.query.articleSources.findMany({
      orderBy: (articleSources) => [desc(articleSources.updatedAt)],
    }),
    db.query.articles.findMany({
      with: { articleSource: true },
      orderBy: (articleTable) => [desc(articleTable.publishedAt)],
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

export const findArticleSourceById = (id: number) =>
  db.query.articleSources.findFirst({
    where: eq(db._schema.articleSources.id, id),
  });

export const deleteArticleById = async (id: number): Promise<void> => {
  await db.delete(db._schema.articles).where(eq(db._schema.articles.id, id));
};

export type ArticleSourceInput = {
  title: string;
  url: string;
  siteUrl: string;
  type: ArticleSourceType;
};

export const insertArticleSource = async (
  input: ArticleSourceInput,
): Promise<void> => {
  await db.insert(db._schema.articleSources).values(input);
};

export const updateArticleSource = async (
  id: number,
  input: ArticleSourceInput,
): Promise<void> => {
  await db
    .update(db._schema.articleSources)
    .set({ ...input, updatedAt: new Date().toISOString() })
    .where(eq(db._schema.articleSources.id, id));
};

export const deleteArticleSourceById = async (id: number): Promise<void> => {
  await db
    .delete(db._schema.articleSources)
    .where(eq(db._schema.articleSources.id, id));
};
