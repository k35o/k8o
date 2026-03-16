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
      if (res.error) {
        onOpen('error', res.error);
        return;
      }
      if (res.failedSources && res.failedSources.length > 0) {
        onOpen(
          'warning',
          `${String(res.newArticles ?? 0)}件追加（失敗: ${res.failedSources.join(', ')}）`,
        );
        return;
      }
      onOpen(
        'success',
        `${String(res.newArticles ?? 0)}件の新しい記事を追加しました`,
      );
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
