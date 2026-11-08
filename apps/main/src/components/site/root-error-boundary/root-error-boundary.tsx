'use client';

import { Button, Heading } from '@k8ordo/ui';
import type { FC, ReactNode } from 'react';

import { ErrorBoundary } from '@/components/site/error-boundary/error-boundary';
import { reportClientError } from '@/shared/browser/report-client-error';

import styles from './root-error-boundary.module.css';

const RootErrorScreen: FC<{ reset: () => void }> = ({ reset }) => (
  <div className={styles.root}>
    <title>問題が発生しました | k8o</title>
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
);

const renderRootErrorScreen = (reset: () => void): ReactNode => (
  <RootErrorScreen reset={reset} />
);

// ルートレイアウトの部品の失敗は、routes/error.tsx の外で起きる。k8ordo にはそれを受ける
// global-error も root の onUncaughtError の口も無いので、ここで受けて報告する
export const RootErrorBoundary: FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundary fallback={renderRootErrorScreen} onError={reportClientError}>
    {children}
  </ErrorBoundary>
);
