'use client';

import { Button, useToast } from '@k8o/arte-odyssey';
import { type FC, useTransition } from 'react';
import { syncBaselineAction } from '../_actions/baseline-actions';

export const SyncBaselineButton: FC = () => {
  const [isPending, startTransition] = useTransition();
  const { onOpen } = useToast();

  const handleSync = () => {
    startTransition(async () => {
      const res = await syncBaselineAction();
      if (res.error) {
        onOpen('error', res.error);
        return;
      }
      const parts = [
        `新規: ${String(res.newFeatures ?? 0)}件`,
        `ステータス変更: ${String(res.statusChanges ?? 0)}件`,
      ];
      onOpen('success', parts.join('、'));
    });
  };

  return (
    <Button
      color="primary"
      disabled={isPending}
      onClick={handleSync}
      size="sm"
      variant="outlined"
    >
      {isPending ? '同期中...' : 'Baselineを同期'}
    </Button>
  );
};
