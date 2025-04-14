import { blogFeedback } from './blog-feedback';
import { blogTag } from './blog-tag';
import { blogViews } from './blog-views';
import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const blogs = pgTable(
  'blogs',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex().on(table.slug)],
);

export const blogsRelations = relations(blogs, ({ one, many }) => ({
  views: one(blogViews),
  blogTag: many(blogTag),
  feedback: many(blogFeedback),
}));
