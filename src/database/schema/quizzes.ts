import { quizAnswers } from './quiz-answers';
import { quizQuestions } from './quiz-questions';
import { quizType } from './quiz-type';
import { relations } from 'drizzle-orm';
import { index, integer, pgTable, serial } from 'drizzle-orm/pg-core';

export const quizzes = pgTable(
  'quizzes',
  {
    id: serial('id').primaryKey(),
    type: integer('type')
      .notNull()
      .references(() => quizType.id),
  },
  (table) => [index().on(table.type)],
);

export const quizzesRelations = relations(
  quizzes,
  ({ one, many }) => ({
    type: one(quizType),
    question: one(quizQuestions, {
      fields: [quizzes.id],
      references: [quizQuestions.quizId],
    }),
    answers: many(quizAnswers),
  }),
);
