'use client';

import { Button, Dialog, Modal } from '@k8o/arte-odyssey';
import type { FC, ReactNode } from 'react';

type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onConfirm: () => void;
  isPending: boolean;
  confirmLabel: string;
  pendingLabel: string;
  children: ReactNode;
};

// 削除・送信・保存などの確認モーダル共通骨格。本文（メッセージやエラー、入力欄）は
// children で渡す。キャンセル/確定ボタンと pending 表示はここで共通化する。
export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  title,
  onConfirm,
  isPending,
  confirmLabel,
  pendingLabel,
  children,
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <Dialog.Root>
      <Dialog.Header onClose={onClose} title={title} />
      <Dialog.Content>
        <div className="flex flex-col gap-6">
          {children}
          <div className="flex justify-end gap-3">
            <Button color="gray" onClick={onClose} variant="outline">
              キャンセル
            </Button>
            <Button
              color="primary"
              disabled={isPending}
              onClick={onConfirm}
              variant="solid"
            >
              {isPending ? pendingLabel : confirmLabel}
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  </Modal>
);
