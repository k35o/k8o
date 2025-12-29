import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { blogs } from './blogs';
import { talkTag } from './talk-tag';

export const talks = sqliteTable(
  'talks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    eventUrl: text('event_url').notNull(),
    eventName: text('event_name').notNull(),
    eventDate: text('event_date').notNull(),
    eventLocation: text('event_location'),
    slideUrl: text('slide_url').notNull(),
    blogId: integer('blog_id')
      .notNull()
      .references(() => blogs.id),
  },
  (table) => [
    index('talks_id_idx').on(table.id),
    index('talks_blog_id_idx').on(table.blogId),
  ],
);

export const talksRelations = relations(talks, ({ many, one }) => ({
  talkTag: many(talkTag),
  blog: one(blogs, {
    fields: [talks.blogId],
    references: [blogs.id],
  }),
}));
