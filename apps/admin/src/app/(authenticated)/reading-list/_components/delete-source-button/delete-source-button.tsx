'use client';

import { Button } from '@k8o/arte-odyssey';
import { useAsyncAction } from '@repo/react-hooks/use-async-action';
import { useState } from 'react';

import { ConfirmDialog } from '@/app/(authenticated)/_components';
import { deleteSource } from '@/features/reading-list/interface/source-actions';

export const DeleteSourceButton = ({
  id,
  title,
}: {
  id: number;
  title: string;
}) => {
  const [open, setOpen] = useState(false);
  const { isPending, error, run } = useAsyncAction();

  const handleDelete = () => {
    run(() => deleteSource(id));
  };

  return (
    <>
      <Button
        color="gray"
        onClick={() => {
          setOpen(true);
        }}
        size="sm"
        variant="outline"
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
        title="ソースの削除"
      >
        <p className="text-sm">
          「{title}」を削除しますか？この操作は取り消せません。
        </p>
        {error !== undefined && (
          <p className="text-fg-error text-sm">{error}</p>
        )}
      </ConfirmDialog>
    </>
  );
};
