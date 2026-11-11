'use client';

import { Button } from '@k8ordo/ui';
import { useState } from 'react';
import { flushSync } from 'react-dom';

import styles from './view-transition-reverse-demo.module.css';

const INITIAL_ITEMS = ['A', 'B', 'C'];

export function ViewTransitionReverseDemo() {
  const [items, setItems] = useState(INITIAL_ITEMS);

  const reverseList = () => {
    document.startViewTransition(() => {
      flushSync(() => {
        setItems((prev) => prev.toReversed());
      });
    });
  };

  return (
    <div className={styles.root}>
      <Button onClick={reverseList}>並びを逆にする</Button>
      <ul className={styles.list}>
        {items.map((item) => (
          <li
            className={styles.item}
            key={item}
            style={{ viewTransitionName: item.toLowerCase() }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
