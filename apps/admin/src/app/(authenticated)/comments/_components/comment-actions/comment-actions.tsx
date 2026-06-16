'use client';

import { Button, Dialog, Modal, useToast } from '@k8o/arte-odyssey';
import { useAsyncAction } from '@repo/react-hooks/use-async-action';
import { type FC, useState } from 'react';

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
      <Modal
        isOpen={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Dialog.Root>
          <Dialog.Header
            onClose={() => {
              setOpen(false);
            }}
            title="コメントの削除"
          />
          <Dialog.Content>
            <div className="flex flex-col gap-6">
              <p className="text-sm">
                このコメントを削除しますか？この操作は取り消せません。
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  color="gray"
                  onClick={() => {
                    setOpen(false);
                  }}
                  variant="outline"
                >
                  キャンセル
                </Button>
                <Button
                  color="primary"
                  disabled={isPending}
                  onClick={handleDelete}
                  variant="solid"
                >
                  {isPending ? '削除中...' : '削除する'}
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      </Modal>
    </>
  );
};
