import { Alert } from '@k8ordo/ui';
import type { FC } from 'react';

// useOffline は Next.js ランタイム外(Storybook)で評価できないため、
// 表示部分を分離して story はこちらを対象にする
export const OfflineNoticeAlert: FC = () => (
  <div className="fixed inset-x-0 bottom-4 z-50 mx-auto w-full max-w-xl px-4">
    <Alert
      message="オフラインです。接続が回復すると自動的に再試行します。"
      tone="warning"
    />
  </div>
);
