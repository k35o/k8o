import { relations } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { articles } from './articles';

export const articleSources = sqliteTable(
  'article_sources',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    url: text('url').notNull(),
    siteUrl: text('site_url').notNull(),
    type: text('type', { enum: ['feed', 'manual'] }).notNull(),
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
