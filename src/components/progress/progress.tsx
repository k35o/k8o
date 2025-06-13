import { toPrecision } from '@/helpers/number/to-precision';
import { FC } from 'react';

export const Progress: FC<{
  progress: number;
  maxProgress: number;
  minProgress?: number;
  label?: string;
}> = ({ progress, maxProgress, minProgress = 0, label }) => {
  return (
    <div className="bg-bg-emphasize w-full rounded-sm">
      <div
        role="progressbar"
        aria-label={
          label ??
          `${toPrecision(progress / maxProgress).toString()}%`
        }
        aria-valuemax={maxProgress}
        aria-valuemin={minProgress}
        aria-valuenow={progress}
        className="bg-primary-fg h-4 rounded-sm"
        style={{
          width: `${((progress / maxProgress) * 100).toString()}%`,
        }}
      />
    </div>
  );
};
