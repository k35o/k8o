import { db } from '@repo/database';
import {
  ARTICLE_SOURCE_TYPES,
  type ArticleSourceType,
} from '@repo/database/schema';
import { count, desc, eq, like } from 'drizzle-orm';

import { fetchOgMetadata } from './og-metadata';

// interface 層は @repo/database を直接参照しないため、ドメイン定義をここで中継する
export { ARTICLE_SOURCE_TYPES, type ArticleSourceType };

// ソース一覧と件数(統計カード用)を返す。記事一覧本体は検索/ページング対応の
// findArticles を使うため、ここでは件数だけを数える。
export const findReadingListContent = async () => {
  const [sources, articleCountRow] = await Promise.all([
    db.query.articleSources.findMany({
      orderBy: (articleSources) => [desc(articleSources.updatedAt)],
    }),
    db.select({ value: count() }).from(db._schema.articles),
  ]);

  return {
    sources,
    feedCount: sources.filter((source) => source.type === 'feed').length,
    articleCount: articleCountRow[0]?.value ?? 0,
  };
};

export const findArticleSourceById = (id: number) =>
  db.query.articleSources.findFirst({
    where: eq(db._schema.articleSources.id, id),
  });

export const deleteArticleById = async (id: number): Promise<void> => {
  await db.delete(db._schema.articles).where(eq(db._schema.articles.id, id));
};

export type ArticleListItem = {
  id: number;
  title: string;
  url: string;
  publishedAt: string;
  sourceName: string;
};

export type FindArticlesResult = {
  items: ArticleListItem[];
  total: number;
};

export const findArticles = async ({
  q,
  page = 1,
  pageSize = 20,
}: {
  q?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<FindArticlesResult> => {
  const where =
    q !== undefined && q !== ''
      ? like(db._schema.articles.title, `%${q}%`)
      : undefined;

  const totalRow = await db
    .select({ value: count() })
    .from(db._schema.articles)
    .where(where);
  const total = totalRow[0]?.value ?? 0;

  const items = await db
    .select({
      id: db._schema.articles.id,
      title: db._schema.articles.title,
      url: db._schema.articles.url,
      publishedAt: db._schema.articles.publishedAt,
      sourceName: db._schema.articleSources.title,
    })
    .from(db._schema.articles)
    .innerJoin(
      db._schema.articleSources,
      eq(db._schema.articleSources.id, db._schema.articles.articleSourceId),
    )
    .where(where)
    .orderBy(desc(db._schema.articles.publishedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items, total };
};

export type ArticleInput = {
  articleSourceId: number;
  title: string;
  url: string;
  publishedAt: string;
  description: string | null;
};

export const insertArticle = async (input: ArticleInput): Promise<void> => {
  await db.insert(db._schema.articles).values(input);
};

export const findArticleForEdit = (id: number) =>
  db.query.articles.findFirst({
    where: eq(db._schema.articles.id, id),
  });

export type ArticleUpdateInput = {
  title: string;
  url: string;
  publishedAt: string;
  description: string | null;
};

export const updateArticleById = async (
  id: number,
  input: ArticleUpdateInput,
): Promise<void> => {
  await db
    .update(db._schema.articles)
    .set(input)
    .where(eq(db._schema.articles.id, id));
};

/**
 * 記事 URL から OGP を取り直し、画像・説明を更新する。
 * 記事が無ければ false。
 */
export const refetchArticleOg = async (id: number): Promise<boolean> => {
  const article = await db.query.articles.findFirst({
    where: eq(db._schema.articles.id, id),
  });
  if (!article) {
    return false;
  }

  const og = await fetchOgMetadata(article.url);
  await db
    .update(db._schema.articles)
    .set({
      imageUrl: og.imageUrl ?? article.imageUrl,
      description: og.description ?? article.description,
    })
    .where(eq(db._schema.articles.id, id));
  return true;
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
