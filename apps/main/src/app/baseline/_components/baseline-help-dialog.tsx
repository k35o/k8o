'use client';

import { AlertIcon, Badge, Dialog, IconButton, Modal } from '@k8o/arte-odyssey';
import { type FC, useCallback, useState } from 'react';

export const BaselineHelpDialog: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <IconButton
        label="Baselineについて"
        onClick={() => setIsOpen(true)}
        size="sm"
      >
        <AlertIcon size="sm" status="info" />
      </IconButton>
      <Modal isOpen={isOpen} onClose={onClose}>
        <Dialog.Root>
          <Dialog.Header onClose={onClose} title="Baselineとは" />
          <Dialog.Content>
            <div className="flex flex-col gap-6">
              <p className="text-sm leading-relaxed">
                Baselineは、対象ブラウザ間で動作するWebプラットフォーム機能の互換性情報を提供します。機能がBaselineに含まれていれば、ブラウザ互換性を信頼できます。
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Badge size="sm" text="Newly" tone="info" />
                  <span className="font-bold text-sm">Newly Available</span>
                </div>
                <p className="text-fg-mute text-sm leading-relaxed">
                  最新のデバイスとブラウザで動作する機能です。古いデバイスやブラウザでは動作しない可能性があります。日付は全対象ブラウザで対応した日を表します。
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Badge size="sm" text="Widely" tone="success" />
                  <span className="font-bold text-sm">Widely Available</span>
                </div>
                <p className="text-fg-mute text-sm leading-relaxed">
                  十分に定着し、多くのデバイスとブラウザで動作する機能です。少なくとも2年半（30ヶ月）以上ブラウザ間で利用可能な状態が続いています。日付はWidely到達日を表します。
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-bold text-sm">対象ブラウザ</span>
                <ul className="flex flex-col gap-1 text-fg-mute text-sm leading-relaxed">
                  <li>Apple Safari（macOS / iOS）</li>
                  <li>Google Chrome（デスクトップ / Android）</li>
                  <li>Microsoft Edge（デスクトップ）</li>
                  <li>Mozilla Firefox（デスクトップ / Android）</li>
                </ul>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      </Modal>
    </>
  );
};
