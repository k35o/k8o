import { db } from '@repo/database';
import { sql } from 'drizzle-orm';
import type { Quiz, QuizType } from './types';

// NOTE:問題数が多いクイズを作った場合はページネーションを実装する
export const getQuizzes = async ({
  type,
  byRandom = false,
  limit,
}: {
  type: QuizType;
  byRandom?: boolean;
  limit?: number;
}): Promise<Quiz[]> => {
  const res = await db.query.quizzes.findMany({
    where: (quiz, { eq }) => eq(quiz.type, type),
    with: {
      question: true,
      answers: true,
    },
    orderBy: byRandom ? [sql`random()`] : [],
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
