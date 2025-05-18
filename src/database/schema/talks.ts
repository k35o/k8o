import { blogs } from './blogs';
import { talkTag } from './talk-tag';
import { relations } from 'drizzle-orm';
import {
  date,
  index,
  integer,
  pgTable,
  serial,
  text,
} from 'drizzle-orm/pg-core';

export const talks = pgTable(
  'talks',
  {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    eventUrl: text('event_url').notNull(),
    eventName: text('event_name').notNull(),
    eventDate: date('event_date').notNull(),
    eventLocation: text('event_location'),
    slideUrl: text('slide_url').notNull(),
    blogId: integer('blog_id')
      .notNull()
      .references(() => blogs.id),
  },
  (table) => [index().on(table.id), index().on(table.blogId)],
);

export const talksRelations = relations(talks, ({ many }) => ({
  talkTag: many(talkTag),
}));
