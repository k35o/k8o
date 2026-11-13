import { cn } from '@repo/helpers/cn';
import type { FC, ReactNode } from 'react';

import { Logo } from '@/app/_components/brand-icons/logo';

import styles from './stage.module.css';

// 16:9 のボックスをコンテナクエリでスケールさせ、中身は cqi 単位で追従する。
// flush は印刷などページ全面に敷くとき用（角丸と影を外す）。
export const Stage: FC<{ children: ReactNode; flush?: boolean }> = ({
  children,
  flush = false,
}) => (
  <div className={styles.root}>
    <div className={cn(styles.box, !flush && styles.framed)}>
      <Logo className={styles.watermark} />
      <div className={styles.content}>{children}</div>
    </div>
  </div>
);
