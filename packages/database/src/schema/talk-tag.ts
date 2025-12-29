import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  sqliteTable,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { tags } from './tags';
import { talks } from './talks';

export const talkTag = sqliteTable(
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
    index('talk_tag_talk_id_idx').on(table.talkId),
    index('talk_tag_tag_id_idx').on(table.tagId),
    uniqueIndex('talk_tag_unique_idx').on(table.talkId, table.tagId),
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
