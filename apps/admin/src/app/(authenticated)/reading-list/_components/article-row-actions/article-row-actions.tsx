'use client';

import { Button, useToast } from '@k8o/arte-odyssey';
import { useAsyncAction } from '@repo/react-hooks/use-async-action';
import { useState } from 'react';
import type { FC } from 'react';

import { ConfirmDialog } from '@/app/(authenticated)/_components';
import {
  deleteArticle,
  refetchArticleMetadata,
} from '@/features/reading-list/interface/article-actions';

const RefetchButton: FC<{ id: number }> = ({ id }) => {
  const { isPending, run } = useAsyncAction();
  const { open: openToast } = useToast();

  const handleRefetch = (): void => {
    run(() => refetchArticleMetadata(id), {
      onError: (message) => {
        openToast('error', message);
      },
      onSuccess: () => {
        openToast('success', 'OGP を再取得しました');
      },
    });
  };

  return (
    <Button
      color="base"
      disabled={isPending}
      onClick={handleRefetch}
      size="sm"
      variant="skeleton"
    >
      {isPending ? '取得中...' : 'OGP再取得'}
    </Button>
  );
};

const DeleteButton: FC<{ id: number; title: string }> = ({ id, title }) => {
  const [open, setOpen] = useState(false);
  const { isPending, error, run } = useAsyncAction();

  const handleDelete = (): void => {
    run(() => deleteArticle(id));
  };

  return (
    <>
      <Button
        color="base"
        onClick={() => {
          setOpen(true);
        }}
        size="sm"
        variant="skeleton"
      >
        削除
      </Button>
      <ConfirmDialog
        confirmLabel="削除する"
        isOpen={open}
        isPending={isPending}
        onClose={() => {
          setOpen(false);
        }}
        onConfirm={handleDelete}
        pendingLabel="削除中..."
        title="取得済み記事の削除"
      >
        <p className="text-sm">「{title}」を削除しますか？</p>
        {error !== undefined && <p className="text-fg-error text-sm">{error}</p>}
      </ConfirmDialog>
    </>
  );
};

export const ArticleRowActions: FC<{ id: number; title: string }> = ({
  id,
  title,
}) => (
  <>
    <RefetchButton id={id} />
    <DeleteButton id={id} title={title} />
  </>
);
