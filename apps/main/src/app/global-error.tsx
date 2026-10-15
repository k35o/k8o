'use client';

import { Button, Heading } from '@k8ordo/ui';

import './_styles/globals.css';
import '@/i18n';

import { cn } from '@repo/helpers/cn';
import { useEffect } from 'react';

import { reportClientError } from '@/shared/browser/report-client-error';

import { mPlus2 } from './_styles/font';

import styles from './global-error.module.css';

// root layout ごと失敗した場合のフォールバックなので、Provider に依存しない最小構成にする
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error);
  }, [error]);

  return (
    <html lang="ja">
      <body className={cn(mPlus2.variable, styles.body)}>
        <div className={styles.content}>
          <div className={styles.message}>
            <Heading level="h1">問題が発生しました</Heading>
            <p className={styles.description}>
              予期しないエラーが発生しました。再試行しても解決しない場合は、時間をおいて再度お試しください。
            </p>
          </div>
          <Button onClick={reset} size="lg">
            再試行
          </Button>
        </div>
      </body>
    </html>
  );
}
