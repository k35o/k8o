import { relations } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { blogComment } from './blog-comment';
import { blogTag } from './blog-tag';
import { blogViews } from './blog-views';
import { talks } from './talks';

export const blogs = sqliteTable(
  'blogs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    slug: text('slug').notNull(),
    published: integer('published', { mode: 'boolean' }).notNull(),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [uniqueIndex('blogs_slug_idx').on(table.slug)],
);

export const blogsRelations = relations(blogs, ({ one, many }) => ({
  views: one(blogViews),
  blogTag: many(blogTag),
  blogComment: many(blogComment),
  talks: many(talks),
}));
