import { blogTag } from './blog-tag';
import { serviceTag } from './service-tag';
import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const tags = pgTable(
  'tags',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
  },
  (table) => [uniqueIndex().on(table.name)],
);

export const tagsRelations = relations(tags, ({ many }) => ({
  blogTag: many(blogTag),
  serviceTag: many(serviceTag),
}));
