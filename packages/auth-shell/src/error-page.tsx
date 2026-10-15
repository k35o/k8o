'use client';

import { Button, Heading } from '@k8ordo/ui';

import styles from './error-page.module.css';

export function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.root}>
      <div className={styles.message}>
        <Heading level="h2">問題が発生しました</Heading>
        <p className={styles.description}>
          予期しないエラーが発生しました。再試行しても解決しない場合は、時間をおいて再度お試しください。
        </p>
      </div>
      <Button onClick={reset} size="lg">
        再試行
      </Button>
    </div>
  );
}
