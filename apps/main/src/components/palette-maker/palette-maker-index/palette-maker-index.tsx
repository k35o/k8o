import { Heading } from '@k8ordo/ui';
import type { FC } from 'react';

import { PaletteMaker } from '../palette-maker/palette-maker';

import styles from './palette-maker-index.module.css';

export const PaletteMakerIndex: FC = () => (
  <div className={styles.root}>
    <div className={styles.content}>
      <Heading level="h2">いろばしご</Heading>
      <section className={styles.section}>
        <PaletteMaker />
      </section>
    </div>
  </div>
);
