'use client';

import { Code, Radio } from '@k8ordo/ui';
import { range } from '@repo/helpers/array/range';
import { useId, useState } from 'react';

import styles from './view-range-demo.module.css';

type AnimationRange = 'cover' | 'contain' | 'entry' | 'exit';

const rangeOptions = [
  { value: 'cover', label: 'cover' },
  { value: 'contain', label: 'contain' },
  { value: 'entry', label: 'entry' },
  { value: 'exit', label: 'exit' },
] as const;

const isAnimationRange = (value: string): value is AnimationRange =>
  rangeOptions.some((option) => option.value === value);

const buildStyle = (
  animationRange: AnimationRange,
): string => `@keyframes sda-reveal {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0);
  }
}

.sda-card {
  animation: sda-reveal auto linear both;
  animation-timeline: view();
  animation-range: ${animationRange};
}`;

export function ViewRangeDemo() {
  const [animationRange, setAnimationRange] = useState<AnimationRange>('cover');
  const labelId = useId();
  const style = buildStyle(animationRange);

  return (
    <div className={styles.root}>
      <style>{style}</style>

      <div className={styles.control}>
        <p className={styles.controlLabel} id={labelId}>
          カードの<Code>animation-range</Code>
        </p>
        <Radio
          aria-labelledby={labelId}
          name={`animation-range-${labelId}`}
          onChange={(value) => {
            if (isAnimationRange(value)) {
              setAnimationRange(value);
            }
          }}
          options={rangeOptions}
          value={animationRange}
        />
      </div>

      <section
        aria-label="カードの見え方に合わせてカードが左から現れる領域"
        className={styles.scroller}
        tabIndex={0}
      >
        <div className={styles.list}>
          {range(0, 3).map((n) => (
            <div className={styles.slot} key={`sda-card-${n}`}>
              <p className={`sda-card ${styles.card}`}>カード {n + 1}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
