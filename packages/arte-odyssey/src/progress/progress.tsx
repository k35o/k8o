import { toPrecision } from '@k8o/helpers/number';
import type { FC } from 'react';

export const Progress: FC<{
  progress: number;
  maxProgress: number;
  minProgress?: number;
  label?: string;
}> = ({ progress, maxProgress, minProgress = 0, label }) => {
  return (
    <div className="w-full rounded-sm bg-bg-emphasize">
      <div
        aria-label={
          label ?? `${toPrecision(progress / maxProgress).toString()}%`
        }
        aria-valuemax={maxProgress}
        aria-valuemin={minProgress}
        aria-valuenow={progress}
        className="h-4 rounded-sm bg-primary-fg"
        role="progressbar"
        style={{
          width: `${((progress / maxProgress) * 100).toString()}%`,
        }}
      />
    </div>
  );
};
