'use client';

import { Checkbox } from '@k8ordo/ui';
import { useState } from 'react';

import styles from './font-family-math-demo.module.css';

export function FontFamilyMathDemo() {
  const [useMathFont, setUseMathFont] = useState(true);

  const fontFamily = useMathFont ? 'math' : 'sans-serif';

  return (
    <div>
      <Checkbox
        label="mathフォントを適用する"
        onChange={(checked) => {
          setUseMathFont(checked);
        }}
        checked={useMathFont}
      />

      <div className={styles.samples}>
        <div>
          <p className={styles.caption}>ピタゴラスの定理（上付き文字）</p>
          <p className={styles.formula} style={{ fontFamily }}>
            x² + y² = z²
          </p>
        </div>

        <div>
          <p className={styles.caption}>等差数列（上付き・下付き文字）</p>
          <p className={styles.formula} style={{ fontFamily }}>
            aₙ = a₁ + (n−1)d
          </p>
        </div>

        <div>
          <p className={styles.caption}>数の集合（Blackboard bold）</p>
          <p className={styles.formula} style={{ fontFamily }}>
            ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ
          </p>
        </div>

        <div>
          <p className={styles.caption}>積分記号</p>
          <p className={styles.formula} style={{ fontFamily }}>
            ∫₀^∞ e⁻ˣ dx = 1
          </p>
        </div>
      </div>
    </div>
  );
}
