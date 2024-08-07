import { Quiz } from '@/drizzle/db';
import { FC } from 'react';

type CollectionProps = FC<{
  quizzes: Quiz[];
}>;

export const CollectionByHighlight: CollectionProps = ({
  quizzes,
}) => {
  return (
    <div className="grid-cols-auto-fit-36 grid place-items-center gap-2 font-notoSansJp">
      {quizzes.map((quiz) => (
        <div
          key={quiz.id}
          className="flex size-36 flex-col items-center justify-center rounded-lg border border-borderLight p-2"
        >
          <p className="text-xs">
            {quiz.answers.map((a) => a.answer).join('・')}
          </p>
          <p className="text-8xl">{quiz.highlight}</p>
        </div>
      ))}
    </div>
  );
};
