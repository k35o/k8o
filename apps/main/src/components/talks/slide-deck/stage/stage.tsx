import type { FC, ReactNode } from 'react';

import { Logo } from '@/components/site/brand-icons/logo';

import { SlideQRCode } from '../slide-qr-code/slide-qr-code';

import styles from './stage.module.css';

export const Stage: FC<{
  children: ReactNode;
  qrUrl?: string;
  flush?: boolean;
  // ページの画像をそのまま見せるデッキ（PDF）は、余白・透かし・QR を重ねずに全面へ描く
  bleed?: boolean;
}> = ({ children, qrUrl, flush = false, bleed = false }) => (
  <div className={styles.frame}>
    <div className={styles.box} data-flush={flush}>
      {!bleed && <Logo className={styles.watermark} />}
      <div className={styles.content} data-bleed={bleed}>
        {children}
      </div>
      {!bleed && qrUrl !== undefined && (
        <SlideQRCode className={styles.qr} url={qrUrl} />
      )}
    </div>
  </div>
);
