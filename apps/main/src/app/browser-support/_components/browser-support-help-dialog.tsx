'use client';

import { AlertIcon, Badge, Dialog, IconButton, Modal } from '@k8o/arte-odyssey';
import { useCallback, useState } from 'react';
import type { FC } from 'react';

export const BrowserSupportHelpDialog: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <IconButton
        label="ステータスについて"
        onClick={() => {
          setIsOpen(true);
        }}
        size="sm"
      >
        <AlertIcon size="sm" status="info" />
      </IconButton>
      <Modal isOpen={isOpen} onClose={onClose}>
        <Dialog.Root>
          <Dialog.Header onClose={onClose} title="ステータスについて" />
          <Dialog.Content>
            <div className="flex flex-col gap-6">
              <p className="text-sm leading-relaxed">
                このページでは、Webプラットフォーム機能が主要ブラウザでどれだけ使えるようになっているかを一覧します。すべての対象ブラウザで安定して使える機能に加えて、まだ一部のブラウザだけが対応している新しい機能（先取り）も表示します。
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Badge size="sm" text="Widely" tone="success" />
                  <span className="text-sm font-bold">Widely Available</span>
                </div>
                <p className="text-fg-mute text-sm leading-relaxed">
                  十分に定着し、多くのデバイスとブラウザで動作する機能です。少なくとも2年半（30ヶ月）以上ブラウザ間で利用可能な状態が続いています。日付はWidely到達日を表します。
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Badge size="sm" text="Newly" tone="info" />
                  <span className="text-sm font-bold">Newly Available</span>
                </div>
                <p className="text-fg-mute text-sm leading-relaxed">
                  最新のデバイスとブラウザで動作する機能です。古いデバイスやブラウザでは動作しない可能性があります。日付は全対象ブラウザで対応した日を表します。
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Badge size="sm" text="Limited" tone="warning" />
                  <span className="text-sm font-bold">
                    Limited availability（先取り）
                  </span>
                </div>
                <p className="text-fg-mute text-sm leading-relaxed">
                  まだ一部のブラウザだけが対応している新しい機能です。全ブラウザが揃うのを待たず、直近1年でブラウザが対応したものを先取りで表示します。日付は最後にブラウザが対応した日を表します。
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold">対象ブラウザ</span>
                <ul className="text-fg-mute flex flex-col gap-1 text-sm leading-relaxed">
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
