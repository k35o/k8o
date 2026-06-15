import { Logo } from '@k8o/arte-odyssey';
import { cn } from '@repo/helpers/cn';
import type { FC, ReactNode } from 'react';

import { SlideQRCode } from '../slide-qr-code';

import styles from './stage.module.css';

export const Stage: FC<{
  children: ReactNode;
  qrUrl?: string;
  flush?: boolean;
}> = ({ children, qrUrl, flush = false }) => (
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
      {qrUrl !== undefined && (
        <SlideQRCode className={cn(styles['qr'], 'absolute')} url={qrUrl} />
      )}
    </div>
  </div>
);
