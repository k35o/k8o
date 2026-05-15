/* oxlint-disable import/no-cycle -- Drizzle relations は双方向参照で schema 間の循環を表現するため */

import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  sqliteTable,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { slides } from './slides';
import { tags } from './tags';

export const slideTag = sqliteTable(
  'slide_tag',
  {
    slideId: integer('slide_id')
      .notNull()
      .references(() => slides.id),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id),
  },
  (table) => [
    index('slide_tag_slide_id_idx').on(table.slideId),
    index('slide_tag_tag_id_idx').on(table.tagId),
    uniqueIndex('slide_tag_unique_idx').on(table.slideId, table.tagId),
  ],
);

export const slideTagRelations = relations(slideTag, ({ one }) => ({
  slide: one(slides, {
    fields: [slideTag.slideId],
    references: [slides.id],
  }),
  tag: one(tags, {
    fields: [slideTag.tagId],
    references: [tags.id],
  }),
}));
