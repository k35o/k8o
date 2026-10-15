import { Logo } from '@k8ordo/ui';
import type { FC, ReactNode } from 'react';

import { SlideQRCode } from '../slide-qr-code';

import styles from './stage.module.css';

export const Stage: FC<{
  children: ReactNode;
  qrUrl?: string;
  flush?: boolean;
}> = ({ children, qrUrl, flush = false }) => (
  <div className={styles.frame}>
    <div className={styles.box} data-flush={flush}>
      <Logo className={styles.watermark} />
      <div className={styles.content}>{children}</div>
      {qrUrl !== undefined && <SlideQRCode className={styles.qr} url={qrUrl} />}
    </div>
  </div>
);
