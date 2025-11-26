import { range } from '@repo/helpers/array/range';
import { cn } from '@repo/helpers/cn';
import { Noto_Sans_JP } from 'next/font/google';
import type { FC } from 'react';
import type { Quiz } from '@/services/quizzes';

type CollectionProps = FC<{
  quizzes: Quiz[];
}>;

const subFont = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
});

export const CollectionByHighlight: CollectionProps = ({ quizzes }) => {
  return (
    <div
      className={cn(
        'grid grid-cols-auto-fit-36 place-items-center gap-2',
        subFont.className,
      )}
    >
      {quizzes.map((quiz) => (
        <div
          className="flex size-36 flex-col items-center justify-center rounded-md border border-border-base p-2"
          key={quiz.id}
        >
          <p className="text-xs">
            {quiz.answers.map((a) => a.answer).join('・')}
          </p>
          <p className="text-highlight">{quiz.highlight}</p>
        </div>
      ))}
    </div>
  );
};

export const CollectionByHighlightLoading: FC = () => {
  return (
    <div className="grid animate-pulse grid-cols-auto-fit-36 place-items-center gap-2">
      {range(0, 100).map((key) => (
        <div
          className="flex size-36 flex-col items-center justify-center rounded-md border border-border-base bg-bg-mute p-2"
          key={key}
        />
      ))}
    </div>
  );
};
