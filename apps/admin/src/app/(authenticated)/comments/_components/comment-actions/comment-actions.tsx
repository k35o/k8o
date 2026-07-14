'use client';

import { Button, useToast } from '@k8o/arte-odyssey';
import { useAsyncAction } from '@repo/react-hooks/use-async-action';
import { useState } from 'react';
import type { FC } from 'react';

import { ConfirmDialog } from '@/app/(authenticated)/_components';
import { deleteComment } from '@/features/comments/interface/actions';

type Props = {
  id: number;
};

export const CommentActions: FC<Props> = ({ id }) => {
  const [open, setOpen] = useState(false);
  const { isPending, run } = useAsyncAction();
  const { onOpen } = useToast();

  const handleDelete = (): void => {
    run(() => deleteComment(id), {
      onError: (message) => {
        onOpen('error', message);
      },
      onSuccess: () => {
        setOpen(false);
        onOpen('success', '削除しました');
      },
    });
  };

  return (
    <>
      <Button
        color="gray"
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
        title="コメントの削除"
      >
        <p className="text-sm">
          このコメントを削除しますか？この操作は取り消せません。
        </p>
      </ConfirmDialog>
    </>
  );
};
