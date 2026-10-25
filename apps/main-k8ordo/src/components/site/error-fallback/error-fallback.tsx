'use client';

import { href } from '@k8ordo/framework';
import type { ErrorProps } from '@k8ordo/framework';
import { Button, Heading } from '@k8ordo/ui';
import { useEffect } from 'react';
import type { FC } from 'react';

import { reportClientError } from '@/shared/browser/report-client-error';

import styles from './error-fallback.module.css';

export const ErrorFallback: FC<ErrorProps> = ({ error, reset }) => {
  useEffect(() => {
    reportClientError(
      error instanceof Error ? error : new Error(String(error)),
    );
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
          renderItem={({
            children,
            disabled: _disabled,
            type: _type,
            ...props
          }) => (
            <a href={href('/')} {...props}>
              {children}
            </a>
          )}
          size="lg"
          variant="outline"
        >
          トップへ戻る
        </Button>
      </div>
    </div>
  );
};
