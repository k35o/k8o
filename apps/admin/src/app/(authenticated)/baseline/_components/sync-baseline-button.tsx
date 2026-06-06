'use client';

import { Button, useToast } from '@k8o/arte-odyssey';
import type { FC } from 'react';

import { syncBaselineAction } from '@/features/baseline/interface/actions';
import { useAsyncAction } from '@/shared/hooks/use-async-action';

export const SyncBaselineButton: FC = () => {
  const { isPending, run } = useAsyncAction();
  const { onOpen } = useToast();

  const handleSync = () => {
    run(syncBaselineAction, {
      onError: (message) => {
        onOpen('error', message);
      },
      onSuccess: (res) => {
        const parts = [
          `新規: ${String(res.newFeatures ?? 0)}件`,
          `ステータス変更: ${String(res.statusChanges ?? 0)}件`,
        ];
        onOpen('success', parts.join('、'));
      },
    });
  };

  return (
    <Button
      color="primary"
      disabled={isPending}
      onClick={handleSync}
      size="sm"
      variant="outline"
    >
      {isPending ? '同期中...' : 'Baselineを同期'}
    </Button>
  );
};
