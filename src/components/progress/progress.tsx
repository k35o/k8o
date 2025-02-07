import { FC } from 'react';

export const Progress: FC<{
  progress: number;
  maxProgress: number;
  minProgress?: number;
}> = ({ progress, maxProgress, minProgress = 0 }) => {
  return (
    <div className="bg-bg-emphasize w-full rounded-md">
      <div
        role="progressbar"
        aria-valuemax={maxProgress}
        aria-valuemin={minProgress}
        aria-valuenow={progress}
        className="bg-primary-fg h-4 rounded-md"
        style={{
          width: `${((progress / maxProgress) * 100).toString()}%`,
        }}
      />
    </div>
  );
};
