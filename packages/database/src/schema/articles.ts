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
    // OGP から取得した画像 URL（取り込み時に保存。未取得なら null）
    imageUrl: text('image_url'),
    // OGP / meta から取得した説明文（未取得なら null）
    description: text('description'),
    // 手動で付与する要約（未設定なら null）
    summary: text('summary'),
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
