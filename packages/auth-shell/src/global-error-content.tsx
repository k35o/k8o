'use client';

import { Button, Heading } from '@k8ordo/ui';
import type { FC } from 'react';

import styles from './global-error-content.module.css';

// html / body は font とグローバル CSS をアプリ側が持つため、呼び出し側の
// global-error.tsx に残す。ここは中身だけを共有する
export const GlobalErrorContent: FC<{ reset: () => void }> = ({ reset }) => (
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
);
