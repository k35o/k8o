'use client';

import { Button, Heading } from '@k8ordo/ui';

// root layout ごと置き換わるので、ロケール集合もここから読み込む
import '@/i18n';

import './_styles/globals.css';

import { cn } from '@repo/helpers/cn';

import { mPlus2, notoSansJp } from './_styles/font';

import styles from './global-error.module.css';

// root layout ごと失敗した場合のフォールバックなので、Provider に依存しない最小構成にする
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body className={cn(mPlus2.variable, notoSansJp.variable, styles.body)}>
        <div className={styles.root}>
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
