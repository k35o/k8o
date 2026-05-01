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
