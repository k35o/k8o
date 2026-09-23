'use client';

import { Code, FormControl, Slider } from '@k8ordo/ui';
import { useState } from 'react';

export function AlphaValueDemo() {
  const [percent, setPercent] = useState(50);

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        .af-value {
          --origin: oklch(55% 0.22 270 / 0.6);
        }
        .af-value-origin {
          background-color: var(--origin);
        }
        .af-value-fixed {
          background-color: alpha(from var(--origin) / var(--alpha-percent));
        }
        .af-value-relative {
          background-color: alpha(from var(--origin) / calc(alpha * var(--alpha-ratio)));
        }
        /* 透明度が見えるように市松模様の上に重ねる */
        .af-checker {
          background-image: repeating-conic-gradient(
            oklch(90% 0 0) 0 25%,
            oklch(100% 0 0) 0 50%
          );
          background-size: 16px 16px;
        }
      `}</style>

      <FormControl
        helpText="元の色は不透明度60%のoklch(55% 0.22 270 / 0.6)です"
        label={`アルファ値: ${String(percent)}%`}
        renderInput={({ 'aria-labelledby': _ariaLabelledby, ...props }) => (
          <Slider
            {...props}
            max={100}
            min={0}
            onChange={setPercent}
            step={5}
            value={percent}
          />
        )}
      />

      <div
        className="af-value flex flex-col gap-3"
        style={{
          '--alpha-percent': `${String(percent)}%`,
          '--alpha-ratio': String(percent / 100),
        }}
      >
        <div className="flex flex-col gap-1">
          <Code>var(--origin)</Code>
          <div className="af-checker overflow-hidden rounded-md">
            <div className="af-value-origin h-12" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Code>{`alpha(from var(--origin) / ${String(percent)}%)`}</Code>
          <div className="af-checker overflow-hidden rounded-md">
            <div className="af-value-fixed h-12" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Code>{`alpha(from var(--origin) / calc(alpha * ${String(percent / 100)}))`}</Code>
          <div className="af-checker overflow-hidden rounded-md">
            <div className="af-value-relative h-12" />
          </div>
        </div>
      </div>

      <p className="text-fg-mute text-sm">
        固定値は元の不透明度に関係なくスライダーの値になります。相対値は元の0.6に係数を掛けるので、同じスライダーの値でも常に固定値より薄くなります。
      </p>
    </div>
  );
}
