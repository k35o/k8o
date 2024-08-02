import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  serial,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const quizzes = pgTable(
  'quizzes',
  {
    id: serial('id').primaryKey(),
    type: integer('type').references(() => quizType.id),
  },
  (table) => {
    return {
      typeIdx: index().on(table.type),
    };
  },
);

export const quizType = pgTable(
  'quiz_type',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
  },
  (table) => {
    return {
      uniqueNameIdx: uniqueIndex().on(table.name),
    };
  },
);

export const quizQuestions = pgTable(
  'quiz_questions',
  {
    id: serial('id').primaryKey(),
    quizId: integer('quiz_id').references(() => quizzes.id),
    question: text('question').notNull(),
  },
  (table) => {
    return {
      quizIdx: uniqueIndex().on(table.quizId),
    };
  },
);

export const quizAnswers = pgTable(
  'quiz_answers',
  {
    id: serial('id').primaryKey(),
    quizId: integer('quiz_id').references(() => quizzes.id),
    answer: text('answer').notNull(),
    explanation: text('explanation'),
  },
  (table) => {
    return {
      quizIdx: index().on(table.quizId),
    };
  },
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

export const quizQuestionsRelations = relations(
  quizQuestions,
  ({ one }) => ({
    quiz: one(quizzes, {
      fields: [quizQuestions.quizId],
      references: [quizzes.id],
    }),
  }),
);

export const quizAnswersRelations = relations(
  quizAnswers,
  ({ one }) => ({
    quiz: one(quizzes, {
      fields: [quizAnswers.quizId],
      references: [quizzes.id],
    }),
  }),
);
