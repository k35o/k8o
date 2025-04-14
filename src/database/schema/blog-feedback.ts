import { blogs } from './blogs';
import { feedbacks } from './feedback';
import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  serial,
  timestamp,
} from 'drizzle-orm/pg-core';

export const blogFeedback = pgTable(
  'blog_feedback',
  {
    id: serial('id').primaryKey(),
    blogId: integer('blog_id')
      .notNull()
      .references(() => blogs.id),
    feedbackId: integer('feedback_id')
      .notNull()
      .references(() => feedbacks.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index().on(table.blogId), index().on(table.feedbackId)],
);

export const blogFeedbackRelations = relations(
  blogFeedback,
  ({ one }) => ({
    blog: one(blogs, {
      fields: [blogFeedback.blogId],
      references: [blogs.id],
    }),
    feedback: one(feedbacks, {
      fields: [blogFeedback.feedbackId],
      references: [feedbacks.id],
    }),
  }),
);
