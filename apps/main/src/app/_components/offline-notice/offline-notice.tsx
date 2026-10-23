'use client';

import { Alert } from '@k8ordo/ui';
import { useSyncExternalStore } from 'react';
import type { FC } from 'react';

import styles from './offline-notice.module.css';

const subscribe = (onChange: () => void): (() => void) => {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
};

const getSnapshot = (): boolean => !navigator.onLine;
const getServerSnapshot = (): boolean => false;

export const OfflineNotice: FC = () => {
  const isOffline = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (!isOffline) {
    return null;
  }

  return (
    <div className={styles.root}>
      <Alert
        message="オフラインです。接続が回復すると自動的に再試行します。"
        tone="warning"
      />
    </div>
  );
};
