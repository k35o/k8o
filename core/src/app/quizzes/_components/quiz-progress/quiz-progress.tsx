import { Progress } from '@k8o/arte-odyssey/progress';
import type { FC } from 'react';

export const QuizProgress: FC<{
  progress: number;
  maxProgress: number;
}> = ({ progress, maxProgress }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="font-bold text-xl">
        第{progress}問
        <span className="font-medium text-md">
          （{progress}/{maxProgress}）
        </span>
      </p>
      <Progress
        label={`${maxProgress.toString()}問中${progress.toString()}問目を出題`}
        maxProgress={maxProgress}
        progress={progress}
      />
    </div>
  );
};
