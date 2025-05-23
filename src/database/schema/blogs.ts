import { blogComment } from './blog-comment';
import { blogTag } from './blog-tag';
import { blogViews } from './blog-views';
import { talks } from './talks';
import { relations } from 'drizzle-orm';
import {
  boolean,
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
    published: boolean('published').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex().on(table.slug)],
);

export const blogsRelations = relations(blogs, ({ one, many }) => ({
  views: one(blogViews),
  blogTag: many(blogTag),
  blogComment: many(blogComment),
  talks: many(talks),
}));
