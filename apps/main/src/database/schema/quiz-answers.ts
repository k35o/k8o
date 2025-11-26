import { relations } from 'drizzle-orm';
import { index, integer, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { quizzes } from './quizzes';

export const quizAnswers = pgTable(
  'quiz_answers',
  {
    id: serial('id').primaryKey(),
    quizId: integer('quiz_id')
      .notNull()
      .references(() => quizzes.id),
    answer: text('answer').notNull(),
    explanation: text('explanation'),
  },
  (table) => [index().on(table.quizId)],
);

export const quizAnswersRelations = relations(quizAnswers, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizAnswers.quizId],
    references: [quizzes.id],
  }),
}));
