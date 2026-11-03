import { Heading } from '@k8ordo/ui';
import type { FC } from 'react';

import { TextField } from '../text-field/text-field';

import styles from './moji-count-index.module.css';

export const MojiCountIndex: FC = () => (
  <div className={styles.root}>
    <div className={styles.content}>
      <Heading level="h2">もじカウント</Heading>
      <section className={styles.section}>
        <TextField />
        <div className={styles.note}>
          <p className={styles.noteText}>
            ※書記素単位に分解して文字数を計測しています
          </p>
        </div>
      </section>
    </div>
  </div>
);
