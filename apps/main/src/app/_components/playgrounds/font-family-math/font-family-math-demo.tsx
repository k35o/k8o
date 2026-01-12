'use client';

import { Checkbox } from '@k8o/arte-odyssey/form/checkbox';
import { useState } from 'react';

/**
 * font-family: mathプロパティのデモ
 * 通常のフォントとmathフォントの違いを比較できる
 */
export function FontFamilyMathDemo() {
  const [useMathFont, setUseMathFont] = useState(true);

  const fontFamily = useMathFont ? 'math' : 'sans-serif';

  return (
    <div className="space-y-6">
      <Checkbox
        label="mathフォントを適用する"
        onChange={(e) => setUseMathFont(e.target.checked)}
        value={useMathFont}
      />

      <div className="space-y-4 rounded-lg border border-border-base bg-bg-base p-6">
        <div>
          <p className="mb-2 text-fg-mute text-sm">
            ピタゴラスの定理（上付き文字）
          </p>
          <p className="text-2xl" style={{ fontFamily }}>
            x² + y² = z²
          </p>
        </div>

        <div>
          <p className="mb-2 text-fg-mute text-sm">
            等差数列（上付き・下付き文字）
          </p>
          <p className="text-2xl" style={{ fontFamily }}>
            aₙ = a₁ + (n−1)d
          </p>
        </div>

        <div>
          <p className="mb-2 text-fg-mute text-sm">
            数の集合（Blackboard bold）
          </p>
          <p className="text-2xl" style={{ fontFamily }}>
            ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ
          </p>
        </div>

        <div>
          <p className="mb-2 text-fg-mute text-sm">積分記号</p>
          <p className="text-2xl" style={{ fontFamily }}>
            ∫₀^∞ e⁻ˣ dx = 1
          </p>
        </div>
      </div>
    </div>
  );
}
