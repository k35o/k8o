import { Button } from '@k8o/arte-odyssey/button';
import { PlusIcon } from '@k8o/arte-odyssey/icons';
import type { FC } from 'react';

export const LoadingCreateColumns: FC = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* ツールバー */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button size="sm" startIcon={<PlusIcon />} variant="outlined">
            カラムを追加
          </Button>
          <span className="text-fg-mute text-sm">0個のカラム</span>
        </div>
        <div className="h-8 w-32 animate-pulse rounded-md bg-bg-mute" />
      </div>

      {/* スケルトン */}
      <div className="flex flex-col gap-3">
        <div className="h-14 animate-pulse rounded-lg border border-border-base bg-bg-mute" />
        <div className="h-14 animate-pulse rounded-lg border border-border-base bg-bg-mute" />
      </div>
    </div>
  );
};
