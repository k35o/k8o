'use client';

import { Code, FormControl, Slider } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { useState } from 'react';

import styles from './token-derivation-demo.module.css';

export function TokenDerivationDemo() {
  const [hue, setHue] = useState(270);

  return (
    <div className={styles.root}>
      <style>{`
        .af-token {
          --brand: oklch(55% 0.22 var(--hue));
          --brand-subtle: alpha(from var(--brand) / 12%);
          --brand-glow: alpha(from var(--brand) / 40%);
        }
        .af-token-badge {
          background-color: var(--brand-subtle);
          color: var(--brand);
        }
        .af-token-input {
          outline: 2px solid var(--brand);
          box-shadow: 0 0 0 4px var(--brand-glow);
        }
      `}</style>

      <FormControl
        label={`--brand の色相: ${String(hue)}`}
        renderInput={({ 'aria-labelledby': _ariaLabelledby, ...props }) => (
          <Slider
            {...props}
            max={360}
            min={0}
            onChange={setHue}
            step={10}
            value={hue}
          />
        )}
      />

      <div
        className={cn('af-token', styles.samples)}
        style={{ '--hue': String(hue) }}
      >
        <span className={cn('af-token-badge', styles.badge)}>
          --brand-subtle
        </span>
        <span className={cn('af-token-input', styles.input)}>--brand-glow</span>
      </div>

      <p className={styles.note}>
        <Code>--brand</Code>
        の色相だけを動かしています。バッジの背景と入力欄の光彩は
        <Code>alpha()</Code>
        で導いた派生色なので、元の色に追従して同じ色相のまま薄くなります。
      </p>
    </div>
  );
}
