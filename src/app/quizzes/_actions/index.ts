'use server';

import { db } from '#database/db';
import * as schema from '#src/database/schema.js';
import { InferSelectModel, sql as ormSql } from 'drizzle-orm';
import { Quiz } from '../_types';

export const getQuizType = async ({
  type,
}: {
  type: InferSelectModel<typeof schema.quizType>['id'];
}) => {
  return db.query.quizType.findFirst({
    where: (quiz, { eq }) => eq(quiz.id, type),
  });
};

// NOTE:問題数が多いクイズを作った場合はページネーションを実装する
export const getQuizzes = async ({
  type,
  byRandom = false,
  limit,
}: {
  type: InferSelectModel<typeof schema.quizType>['id'];
  byRandom?: boolean;
  limit?: number;
}): Promise<Quiz[]> => {
  const res = await db.query.quizzes.findMany({
    where: (quiz, { eq }) => eq(quiz.type, type),
    with: {
      question: true,
      answers: true,
    },
    orderBy: byRandom ? [ormSql`random()`] : [],
    ...(limit ? { limit } : {}),
  });

  return res.map((quiz) => ({
    id: quiz.id,
    highlight: quiz.question.highlight,
    question: quiz.question.question,
    answers: quiz.answers.map((answer) => ({
      id: answer.id,
      answer: answer.answer,
      explanation: answer.explanation,
    })),
  }));
};
