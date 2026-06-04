/* oxlint-disable import/no-cycle -- Drizzle relations は双方向参照で schema 間の循環を表現するため */

import { relations } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { articles } from './articles';

// 記事ソースの種別。アプリ側もこの定義を SSoT として参照する。
export const ARTICLE_SOURCE_TYPES = ['feed', 'manual'] as const;
export type ArticleSourceType = (typeof ARTICLE_SOURCE_TYPES)[number];

export const articleSources = sqliteTable(
  'article_sources',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    url: text('url').notNull(),
    siteUrl: text('site_url').notNull(),
    type: text('type', { enum: ARTICLE_SOURCE_TYPES }).notNull(),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [uniqueIndex('article_sources_url_idx').on(table.url)],
);

export const articleSourcesRelations = relations(
  articleSources,
  ({ many }) => ({
    articles: many(articles),
  }),
);
