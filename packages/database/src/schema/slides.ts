/* oxlint-disable import/no-cycle -- Drizzle relations は双方向参照で schema 間の循環を表現するため */

import { relations } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { slideTag } from './slide-tag';

export const slides = sqliteTable(
  'slides',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    slug: text('slug').notNull(),
    published: integer('published', { mode: 'boolean' }).notNull(),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [uniqueIndex('slides_slug_idx').on(table.slug)],
);

export const slidesRelations = relations(slides, ({ many }) => ({
  slideTag: many(slideTag),
}));
