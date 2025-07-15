import { db } from '#database/db';
import { quizType } from '@/database/schema/quiz-type';
import { InferSelectModel } from 'drizzle-orm';

export const getQuizType = async ({
  type,
}: {
  type: InferSelectModel<typeof quizType>['id'];
}) => {
  return db.query.quizType.findFirst({
    where: (quiz, { eq }) => eq(quiz.id, type),
  });
};
