'use client';

import { Button, useToast } from '@k8o/arte-odyssey';
import { type FC, useTransition } from 'react';

import { syncArticlesAction } from '../../_actions/article-actions';

export const SyncButton: FC = () => {
  const [isPending, startTransition] = useTransition();
  const { onOpen } = useToast();

  const handleSync = () => {
    startTransition(async () => {
      const res = await syncArticlesAction();
      if (res.error !== undefined) {
        onOpen('error', res.error);
        return;
      }
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
      {isPending ? '同期中...' : '記事を同期'}
    </Button>
  );
};
