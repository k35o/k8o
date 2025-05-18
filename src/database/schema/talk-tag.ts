import { tags } from './tags';
import { talks } from './talks';
import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const talkTag = pgTable(
  'talk_tag',
  {
    talkId: integer('talk_id')
      .notNull()
      .references(() => talks.id),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id),
  },
  (table) => [
    index().on(table.talkId),
    index().on(table.tagId),
    uniqueIndex().on(table.talkId, table.tagId),
  ],
);

export const talkTagRelations = relations(talkTag, ({ one }) => ({
  talk: one(talks, {
    fields: [talkTag.talkId],
    references: [talks.id],
  }),
  tag: one(tags, {
    fields: [talkTag.tagId],
    references: [tags.id],
  }),
}));
