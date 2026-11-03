import { Heading } from '@k8ordo/ui';
import type { FC } from 'react';

import { ColorQuiz } from '../color-quiz/color-quiz';

import styles from './color-quiz-index.module.css';

export const ColorQuizIndex: FC = () => (
  <div className={styles.root}>
    <div className={styles.content}>
      <Heading level="h2">カラーHexクイズ</Heading>
      <section className={styles.section}>
        <ColorQuiz />
      </section>
    </div>
  </div>
);
