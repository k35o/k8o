/* oxlint-disable import/no-cycle -- Drizzle relations は双方向参照で schema 間の循環を表現するため */

import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { articleSources } from './article-sources';

export const articles = sqliteTable(
  'articles',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    articleSourceId: integer('article_source_id')
      .notNull()
      .references(() => articleSources.id),
    title: text('title').notNull(),
    url: text('url').notNull(),
    publishedAt: text('published_at').notNull(),
    imageUrl: text('image_url'),
    description: text('description'),
    summary: text('summary'),
    // 要約生成を開始した試行回数（生成前に予約 increment）。上限まで試行しても
    // summary が無い記事は以降あきらめ、説明文のまま確定表示する
    summaryAttempts: integer('summary_attempts').notNull().default(0),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
      .$onUpdate(() => new Date().toISOString()),
  },
  (table) => [
    uniqueIndex('articles_url_idx').on(table.url),
    index('articles_source_id_idx').on(table.articleSourceId),
    index('articles_published_at_idx').on(table.publishedAt),
  ],
);

export const articlesRelations = relations(articles, ({ one }) => ({
  articleSource: one(articleSources, {
    fields: [articles.articleSourceId],
    references: [articleSources.id],
  }),
}));
