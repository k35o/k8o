import { Alert } from '@k8ordo/ui';
import type { FC } from 'react';

import styles from './offline-notice-alert.module.css';

// useOffline は Next.js ランタイム外(Storybook)で評価できないため、
// 表示部分を分離して story はこちらを対象にする
export const OfflineNoticeAlert: FC = () => (
  <div className={styles.root}>
    <Alert
      message="オフラインです。接続が回復すると自動的に再試行します。"
      tone="warning"
    />
  </div>
);
