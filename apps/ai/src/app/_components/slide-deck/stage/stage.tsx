import { Logo } from '@k8o/arte-odyssey';
import { cn } from '@repo/helpers/cn';
import type { FC, ReactNode } from 'react';

import styles from './stage.module.css';

// apps/main の slides の Stage を移植したもの（QRコードは省略）。
// 16:9 のボックスをコンテナクエリでスケールさせ、中身は cqi 単位で追従する。
// flush は印刷などページ全面に敷くとき用（角丸と影を外す）。
export const Stage: FC<{ children: ReactNode; flush?: boolean }> = ({
  children,
  flush = false,
}) => (
  <div className={cn(styles['frame'], 'relative size-full')}>
    <div
      className={cn(
        styles['box'],
        'bg-bg-base text-fg-base relative overflow-hidden',
        flush ? null : 'rounded-lg shadow-md',
      )}
    >
      <Logo
        aria-hidden="true"
        className={cn(styles['watermark'], 'pointer-events-none absolute')}
      />
      <div
        className={cn(styles['content'], 'relative flex size-full flex-col')}
      >
        {children}
      </div>
    </div>
  </div>
);
