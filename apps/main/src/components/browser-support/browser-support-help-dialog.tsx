'use client';

import { AlertIcon, Badge, Dialog, IconButton, Modal } from '@k8ordo/ui';
import { useCallback, useState } from 'react';
import type { FC } from 'react';

import styles from './browser-support-help-dialog.module.css';

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
            <div className={styles.root}>
              <p className={styles.lead}>
                このページでは、Webプラットフォーム機能が主要ブラウザでどれだけ使えるようになっているかを一覧します。すべての対象ブラウザで安定して使える機能に加えて、まだ一部のブラウザだけが対応している新しい機能（先取り）も表示します。
              </p>
              <div className={styles.status}>
                <div className={styles.statusHeader}>
                  <Badge size="sm" label="Widely" tone="success" />
                  <span className={styles.statusName}>Widely Available</span>
                </div>
                <p className={styles.statusDescription}>
                  十分に定着し、多くのデバイスとブラウザで動作する機能です。少なくとも2年半（30ヶ月）以上ブラウザ間で利用可能な状態が続いています。日付はWidely到達日を表します。
                </p>
              </div>
              <div className={styles.status}>
                <div className={styles.statusHeader}>
                  <Badge size="sm" label="Newly" tone="info" />
                  <span className={styles.statusName}>Newly Available</span>
                </div>
                <p className={styles.statusDescription}>
                  最新のデバイスとブラウザで動作する機能です。古いデバイスやブラウザでは動作しない可能性があります。日付は全対象ブラウザで対応した日を表します。
                </p>
              </div>
              <div className={styles.status}>
                <div className={styles.statusHeader}>
                  <Badge size="sm" label="Limited" tone="warning" />
                  <span className={styles.statusName}>
                    Limited availability（先取り）
                  </span>
                </div>
                <p className={styles.statusDescription}>
                  まだ一部のブラウザだけが対応している新しい機能です。全ブラウザが揃うのを待たず、直近1年でブラウザが対応したものを先取りで表示します。日付は最後にブラウザが対応した日を表します。
                </p>
              </div>
              <div className={styles.status}>
                <span className={styles.statusName}>対象ブラウザ</span>
                <ul className={styles.browsers}>
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
