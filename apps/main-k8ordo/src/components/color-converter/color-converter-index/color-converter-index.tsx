import { Heading } from '@k8ordo/ui';
import type { FC } from 'react';

import { ColorConverter } from '../color-converter/color-converter';

import styles from './color-converter-index.module.css';

export const ColorConverterIndex: FC = () => (
  <div className={styles.root}>
    <div className={styles.content}>
      <Heading level="h2">カラーコード職人</Heading>
      <section className={styles.section}>
        <ColorConverter />
      </section>
    </div>
  </div>
);
