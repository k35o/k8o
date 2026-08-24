'use client';

import { Button, TextField, useToast } from '@k8o/arte-odyssey';
import { useAsyncAction } from '@repo/react-hooks/use-async-action';
import { useState } from 'react';
import type { ChangeEvent, FC } from 'react';

import { ConfirmDialog } from '@/app/(authenticated)/_components';
import { deleteTag, renameTag } from '@/features/tags/interface/actions';

type Props = {
  id: number;
  name: string;
  // 使用中のタグは削除できない
  canDelete: boolean;
};

export const TagRowActions: FC<Props> = ({ id, name: initialName, canDelete }) => {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const { isPending, run } = useAsyncAction();
  const { open } = useToast();

  const handleRename = (): void => {
    run(() => renameTag(id, name), {
      onError: (message) => {
        open('error', message);
      },
      onSuccess: () => {
        setRenameOpen(false);
        open('success', 'タグ名を更新しました');
      },
    });
  };

  const handleDelete = (): void => {
    run(() => deleteTag(id), {
      onError: (message) => {
        open('error', message);
      },
      onSuccess: () => {
        setDeleteOpen(false);
        open('success', 'タグを削除しました');
      },
    });
  };

  const closeRename = (): void => {
    setRenameOpen(false);
    setName(initialName);
  };

  return (
    <>
      <Button
        color="base"
        onClick={() => {
          setRenameOpen(true);
        }}
        size="sm"
        variant="skeleton"
      >
        名前変更
      </Button>
      <Button
        color="base"
        disabled={!canDelete}
        onClick={() => {
          setDeleteOpen(true);
        }}
        size="sm"
        variant="skeleton"
      >
        削除
      </Button>

      <ConfirmDialog
        confirmLabel="保存"
        isOpen={renameOpen}
        isPending={isPending}
        onClose={closeRename}
        onConfirm={handleRename}
        pendingLabel="保存中..."
        title="タグ名の変更"
      >
        <TextField
          aria-label="新しいタグ名"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setName(e.target.value);
          }}
          size={28}
          value={name}
        />
      </ConfirmDialog>

      <ConfirmDialog
        confirmLabel="削除する"
        isOpen={deleteOpen}
        isPending={isPending}
        onClose={() => {
          setDeleteOpen(false);
        }}
        onConfirm={handleDelete}
        pendingLabel="削除中..."
        title="タグの削除"
      >
        <p className="text-sm">「{initialName}」を削除しますか？</p>
      </ConfirmDialog>
    </>
  );
};
