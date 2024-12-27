import { FC } from 'react';

export const Progress: FC<{
  progress: number;
  maxProgress: number;
  minProgress?: number;
}> = ({ progress, maxProgress, minProgress = 0 }) => {
  return (
    <div className="w-full rounded-md bg-chartEmpty">
      <div
        role="progressbar"
        aria-valuemax={maxProgress}
        aria-valuemin={minProgress}
        aria-valuenow={progress}
        className="h-4 rounded-md bg-chartPrimary"
        style={{
          width: `${((progress / maxProgress) * 100).toString()}%`,
        }}
      />
    </div>
  );
};
