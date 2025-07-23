import { Progress } from '@k8o/arte-odyssey/progress';
import { FC } from 'react';

export const QuizProgress: FC<{
  progress: number;
  maxProgress: number;
}> = ({ progress, maxProgress }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-xl font-bold">
        第{progress}問
        <span className="text-md font-medium">
          （{progress}/{maxProgress}）
        </span>
      </p>
      <Progress
        progress={progress}
        maxProgress={maxProgress}
        label={`${maxProgress.toString()}問中${progress.toString()}問目を出題`}
      />
    </div>
  );
};
