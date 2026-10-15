'use client';

import { Button, Code, FormControl, Slider } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { useState } from 'react';

import styles from './sibling-index-stagger-demo.module.css';

export function SiblingIndexStaggerDemo() {
  const [count, setCount] = useState(5);
  const [playKey, setPlayKey] = useState(0);

  return (
    <div className={styles.root}>
      <style>{`
        @keyframes sci-stagger-fade-in {
          from {
            opacity: 0;
            translate: 0 8px;
          }
          to {
            opacity: 1;
            translate: 0 0;
          }
        }

        .sci-stagger-item {
          counter-reset: sci-index sibling-index();
          animation-name: sci-stagger-fade-in;
          animation-duration: 320ms;
          animation-fill-mode: backwards;
          animation-delay: calc(sibling-index() * 90ms);
        }

        .sci-stagger-item::before {
          content: counter(sci-index) "番目の項目";
        }
      `}</style>

      <div className={styles.controls}>
        <div className={styles.field}>
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
        </div>
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

      <ul className={styles.list} key={`${String(count)}-${String(playKey)}`}>
        {Array.from({ length: count }, (_, index) => (
          <li className={cn('sci-stagger-item', styles.item)} key={index} />
        ))}
      </ul>

      <p className={styles.note}>
        遅延は<Code>animation-delay: calc(sibling-index() * 90ms)</Code>
        、行頭の番号は<Code>counter-reset</Code>に渡した
        <Code>sibling-index()</Code>
        です。項目数を変えても、マークアップ側で番号を配り直す必要はありません。
      </p>
    </div>
  );
}
