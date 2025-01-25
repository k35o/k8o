import { Quiz } from './../../_types';
import clsx from 'clsx';
import { Noto_Sans_JP } from 'next/font/google';
import { FC } from 'react';

type CollectionProps = FC<{
  quizzes: Quiz[];
}>;

const subFont = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
});

export const CollectionByHighlight: CollectionProps = ({
  quizzes,
}) => {
  return (
    <div
      className={clsx(
        'grid-cols-auto-fit-36 grid place-items-center gap-2',
        subFont.className,
      )}
    >
      {quizzes.map((quiz) => (
        <div
          key={quiz.id}
          className="border-border-primary flex size-36 flex-col items-center justify-center rounded-lg border p-2"
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
