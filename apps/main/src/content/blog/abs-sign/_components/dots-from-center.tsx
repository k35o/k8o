'use client';

import { Button } from '@k8ordo/ui';
import { useState } from 'react';

import styles from './dots-from-center.module.css';

const INDEXES = [0, 1, 2, 3, 4, 5, 6] as const;

export const DotsFromCenter = () => {
  const [playKey, setPlayKey] = useState(0);

  return (
    <div className={styles.root}>
      <ul className={styles.dots} key={playKey}>
        {INDEXES.map((index) => (
          <li className={styles.dot} key={index} style={{ '--i': index }} />
        ))}
      </ul>
      <Button
        color="base"
        onClick={() => {
          setPlayKey((prev) => prev + 1);
        }}
        variant="outline"
      >
        もう一度再生
      </Button>
    </div>
  );
};
