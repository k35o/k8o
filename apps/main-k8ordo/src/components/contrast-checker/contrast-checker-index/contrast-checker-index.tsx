import { Heading } from '@k8ordo/ui';
import type { FC } from 'react';

import { CheckContrast } from '../check-contrast/check-contrast';
import { Description } from '../description/description';

import styles from './contrast-checker-index.module.css';

export const ContrastCheckerIndex: FC = () => (
  <div className={styles.root}>
    <div className={styles.content}>
      <Heading level="h2">コントラストチェッカー</Heading>
      <section className={styles.section}>
        <CheckContrast />
        <Description />
      </section>
    </div>
  </div>
);
