import { blogComment } from './blog-comment';
import { feedbacks } from './feedback';
import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const comments = pgTable(
  'comments',
  {
    id: serial('id').primaryKey(),
    message: text('message'),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    feedbackId: integer('feedback_id').references(() => feedbacks.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .$onUpdate(() => new Date())
      .defaultNow(),
  },
  (table) => [index().on(table.id), index().on(table.feedbackId)],
);

export const commentsRelations = relations(comments, ({ one }) => ({
  blogComment: one(blogComment, {
    fields: [comments.id],
    references: [blogComment.commentId],
  }),
  feedback: one(feedbacks, {
    fields: [comments.feedbackId],
    references: [feedbacks.id],
  }),
}));
