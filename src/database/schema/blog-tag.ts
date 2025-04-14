import { blogs } from './blogs';
import { tags } from './tags';
import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const blogTag = pgTable(
  'blog_tag',
  {
    blogId: integer('blog_id')
      .notNull()
      .references(() => blogs.id),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id),
  },
  (table) => [
    index().on(table.blogId),
    index().on(table.tagId),
    uniqueIndex().on(table.blogId, table.tagId),
  ],
);

export const blogTagRelations = relations(blogTag, ({ one }) => ({
  blog: one(blogs, {
    fields: [blogTag.blogId],
    references: [blogs.id],
  }),
  tag: one(tags, {
    fields: [blogTag.tagId],
    references: [tags.id],
  }),
}));
