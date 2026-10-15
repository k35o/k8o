'use client';

import { Button, Heading } from '@k8ordo/ui';
import Link from 'next/link';
import { useEffect } from 'react';

import { reportClientError } from '@/shared/browser/report-client-error';

import styles from './error.module.css';

export default function ErrorPage({
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
    <div className={styles.root}>
      <div className={styles.message}>
        <Heading level="h2">問題が発生しました</Heading>
        <p className={styles.description}>
          予期しないエラーが発生しました。再試行しても解決しない場合は、時間をおいて再度お試しください。
        </p>
      </div>
      <div className={styles.actions}>
        <Button onClick={reset} size="lg">
          再試行
        </Button>
        <Button
          color="base"
          // next/link は onClick や ref に明示的な undefined を受けない
          // (exactOptionalPropertyTypes) ため、束は展開せず要るものだけ取り出す
          renderItem={({ className, children }) => (
            <Link className={className} href="/">
              {children}
            </Link>
          )}
          size="lg"
          variant="outline"
        >
          トップへ戻る
        </Button>
      </div>
    </div>
  );
}
