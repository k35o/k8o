'use client';

import { Code, FormControl, Slider } from '@k8ordo/ui';
import { useState } from 'react';

export function TokenDerivationDemo() {
  const [hue, setHue] = useState(270);

  return (
    <div className="flex flex-col gap-6">
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
        className="af-token flex flex-wrap items-center gap-4"
        style={{ '--hue': String(hue) }}
      >
        <span className="af-token-badge rounded-full px-3 py-1 text-sm font-bold">
          --brand-subtle
        </span>
        <span className="af-token-input text-fg-base rounded-md px-4 py-2 text-sm">
          --brand-glow
        </span>
      </div>

      <p className="text-fg-mute text-sm">
        <Code>--brand</Code>
        の色相だけを動かしています。バッジの背景と入力欄の光彩は
        <Code>alpha()</Code>
        で導いた派生色なので、元の色に追従して同じ色相のまま薄くなります。
      </p>
    </div>
  );
}
