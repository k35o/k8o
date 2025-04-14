import { quizzes } from './quzzes';
import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  serial,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const quizQuestions = pgTable(
  'quiz_questions',
  {
    id: serial('id').primaryKey(),
    quizId: integer('quiz_id')
      .notNull()
      .references(() => quizzes.id),
    highlight: text('highlight'),
    question: text('question').notNull(),
  },
  (table) => [uniqueIndex().on(table.quizId)],
);

export const quizQuestionsRelations = relations(
  quizQuestions,
  ({ one }) => ({
    quiz: one(quizzes, {
      fields: [quizQuestions.quizId],
      references: [quizzes.id],
    }),
  }),
);
