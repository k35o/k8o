'use client';

import { Button, useToast } from '@k8o/arte-odyssey';
import { useAsyncAction } from '@repo/react-hooks/use-async-action';
import type { FC } from 'react';

import { syncBrowserSupportAction } from '@/features/browser-support/interface/actions';

export const SyncBrowserSupportButton: FC = () => {
  const { isPending, run } = useAsyncAction();
  const { onOpen } = useToast();

  const handleSync = () => {
    run(syncBrowserSupportAction, {
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
      {isPending ? '同期中...' : 'Browser Supportを同期'}
    </Button>
  );
};
