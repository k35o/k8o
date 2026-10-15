'use client';

import { Code, FormControl, Slider } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { useState } from 'react';

import styles from './sibling-progress-demo.module.css';

export function SiblingProgressDemo() {
  const [count, setCount] = useState(5);

  return (
    <div className={styles.root}>
      <style>{`
        .pf-sibling-item {
          --ratio: progress(sibling-index(), 1, sibling-count());
          width: calc(30% + var(--ratio) * 70%);
          opacity: calc(0.3 + var(--ratio) * 0.7);
        }
      `}</style>

      <FormControl
        label={`項目数: ${String(count)}`}
        renderInput={({ 'aria-labelledby': _ariaLabelledby, ...props }) => (
          <Slider
            {...props}
            max={8}
            min={2}
            onChange={setCount}
            value={count}
          />
        )}
      />

      <ul className={styles.list}>
        {Array.from({ length: count }, (_, index) => (
          <li className={cn('pf-sibling-item', styles.item)} key={index}>
            項目
          </li>
        ))}
      </ul>

      <p className={styles.note}>
        <Code>progress(sibling-index(), 1, sibling-count())</Code>
        で先頭を0、末尾を1にしています。項目数を変えても、最初と最後が両端に張り付いたまま間が等分されます。
      </p>
    </div>
  );
}
