import { relations } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { blogTag } from './blog-tag';
import { serviceTag } from './service-tag';
import { talkTag } from './talk-tag';

export const tags = sqliteTable(
  'tags',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
  },
  (table) => [uniqueIndex('tags_name_idx').on(table.name)],
);

export const tagsRelations = relations(tags, ({ many }) => ({
  blogTag: many(blogTag),
  serviceTag: many(serviceTag),
  talkTag: many(talkTag),
}));
