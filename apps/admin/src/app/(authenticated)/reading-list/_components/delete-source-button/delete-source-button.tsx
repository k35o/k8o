'use client';

import { Button, Dialog, Modal } from '@k8o/arte-odyssey';
import { useState, useTransition } from 'react';
import { deleteSource } from '@/features/reading-list/interface/source-actions';

export const DeleteSourceButton = ({
  id,
  title,
}: {
  id: number;
  title: string;
}) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const handleDelete = () => {
    setError(undefined);
    startTransition(async () => {
      const result = await deleteSource(id);
      if (result.error) {
        setError(result.error);
      }
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
        variant="outlined"
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
            title="ソースの削除"
          />
          <Dialog.Content>
            <div className="flex flex-col gap-6">
              <p className="text-sm">
                「{title}」を削除しますか？この操作は取り消せません。
              </p>
              {error && <p className="text-fg-error text-sm">{error}</p>}
              <div className="flex justify-end gap-3">
                <Button
                  color="gray"
                  onClick={() => {
                    setOpen(false);
                  }}
                  variant="outlined"
                >
                  キャンセル
                </Button>
                <Button
                  color="primary"
                  disabled={isPending}
                  onClick={handleDelete}
                  variant="contained"
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
