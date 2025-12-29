import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  sqliteTable,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { blogs } from './blogs';
import { tags } from './tags';

export const blogTag = sqliteTable(
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
    index('blog_tag_blog_id_idx').on(table.blogId),
    index('blog_tag_tag_id_idx').on(table.tagId),
    uniqueIndex('blog_tag_unique_idx').on(table.blogId, table.tagId),
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
