import { relations } from 'drizzle-orm';
import { index, integer, pgTable } from 'drizzle-orm/pg-core';
import { blogs } from './blogs';
import { comments } from './comments';

export const blogComment = pgTable(
  'blog_comment',
  {
    blogId: integer('blog_id')
      .notNull()
      .references(() => blogs.id),
    commentId: integer('commend_id')
      .notNull()
      .references(() => comments.id),
  },
  (table) => [index().on(table.blogId), index().on(table.commentId)],
);

export const blogCommentRelations = relations(blogComment, ({ one }) => ({
  blog: one(blogs, {
    fields: [blogComment.blogId],
    references: [blogs.id],
  }),
  feedback: one(comments, {
    fields: [blogComment.commentId],
    references: [comments.id],
  }),
}));
