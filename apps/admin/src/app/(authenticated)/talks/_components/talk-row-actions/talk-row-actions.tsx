'use client';

import { Button, useToast } from '@k8o/arte-odyssey';
import { useAsyncAction } from '@repo/react-hooks/use-async-action';
import { useState } from 'react';
import type { FC } from 'react';

import { ConfirmDialog } from '@/app/(authenticated)/_components';
import { deleteTalk } from '@/features/talks/interface/actions';

type Props = {
  id: number;
  title: string;
};

export const TalkRowActions: FC<Props> = ({ id, title }) => {
  const [open, setOpen] = useState(false);
  const { isPending, run } = useAsyncAction();
  const { open: openToast } = useToast();

  const handleDelete = (): void => {
    run(() => deleteTalk(id), {
      onError: (message) => {
        openToast('error', message);
      },
      onSuccess: () => {
        setOpen(false);
        openToast('success', 'トークを削除しました');
      },
    });
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
        title="トークの削除"
      >
        <p className="text-sm">「{title}」を削除しますか？</p>
      </ConfirmDialog>
    </>
  );
};
