/* oxlint-disable import/no-cycle -- Drizzle relations は双方向参照で schema 間の循環を表現するため */

import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { blogs } from './blogs.ts';
import { talkTag } from './talk-tag.ts';

export const talks = sqliteTable(
  'talks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    // k8o.me に置くデッキの名前（/talks/<slug>）。デッキを出すときに入れる
    slug: text('slug'),
    // デッキを出し始める時刻（オフセット付きの ISO 8601）。この時刻まではビルドがデッキを取り込まない。空ならすぐに出す
    deckPublishedAt: text('deck_published_at'),
    eventUrl: text('event_url').notNull(),
    eventName: text('event_name').notNull(),
    eventDate: text('event_date').notNull(),
    eventLocation: text('event_location'),
    slideUrl: text('slide_url'),
    blogId: integer('blog_id').references(() => blogs.id),
  },
  (table) => [
    index('talks_blog_id_idx').on(table.blogId),
    uniqueIndex('talks_slug_idx').on(table.slug),
  ],
);

export const talksRelations = relations(talks, ({ many, one }) => ({
  talkTag: many(talkTag),
  blog: one(blogs, {
    fields: [talks.blogId],
    references: [blogs.id],
  }),
}));
