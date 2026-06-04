'use client';

import { Button, useToast } from '@k8o/arte-odyssey';
import type { FC } from 'react';

import { syncArticlesAction } from '@/features/reading-list/interface/article-actions';
import { useAsyncAction } from '@/shared/hooks/use-async-action';

export const SyncButton: FC = () => {
  const { isPending, run } = useAsyncAction();
  const { onOpen } = useToast();

  const handleSync = () => {
    run(syncArticlesAction, {
      onError: (message) => {
        onOpen('error', message);
      },
      onSuccess: (res) => {
        if (res.failedSources !== undefined && res.failedSources.length > 0) {
          onOpen(
            'warning',
            `${String(res.newArticles ?? 0)}件追加、${String(res.updatedArticles ?? 0)}件更新（失敗: ${res.failedSources.join(', ')}）`,
          );
          return;
        }
        const parts = [
          `${String(res.newArticles ?? 0)}件追加`,
          `${String(res.updatedArticles ?? 0)}件更新`,
          `${String(res.enrichedArticles ?? 0)}件OGP補完`,
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
      variant="outlined"
    >
      {isPending ? '同期中...' : '記事を同期'}
    </Button>
  );
};
