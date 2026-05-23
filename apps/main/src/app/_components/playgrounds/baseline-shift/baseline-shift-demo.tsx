'use client';

import { FormControl, Select } from '@k8o/arte-odyssey';
import { useState } from 'react';

type BaselineShiftValue = '0' | 'sub' | 'super' | '0.3em' | '-0.3em';

const FONT_SIZE = 28;
const BASELINE_Y = 40;
const SVG_WIDTH = 360;

type Example = {
  prefix: string;
  shifted: string;
  suffix: string;
};

const EXAMPLES: readonly Example[] = [
  { prefix: '水の化学式は H', shifted: '2', suffix: 'O です。' },
  { prefix: '面積は 10 m', shifted: '2', suffix: ' です。' },
  { prefix: '注釈付きの語', shifted: '※1', suffix: 'を本文に。' },
];

export function BaselineShiftDemo() {
  const [value, setValue] = useState<BaselineShiftValue>('super');

  return (
    <div className="flex flex-col gap-6">
      <FormControl
        label="baseline-shift"
        renderInput={({ 'aria-labelledby': _, ...props }) => (
          <Select
            {...props}
            onChange={(e) => {
              setValue(e.target.value as BaselineShiftValue);
            }}
            options={[
              { value: '0', label: '0 (既定)' },
              { value: 'sub', label: 'sub' },
              { value: 'super', label: 'super' },
              { value: '0.3em', label: '0.3em' },
              { value: '-0.3em', label: '-0.3em' },
            ]}
            value={value}
          />
        )}
      />

      <p className="text-fg-mute text-sm">
        SVGの <code>tspan</code> に <code>baseline-shift: {value}</code>{' '}
        を当てています。赤い文字がずらしの対象、グレーの破線が親{' '}
        <code>text</code> のベースラインです。
      </p>

      <div className="bg-bg-base flex flex-col gap-2 rounded-xl p-6 shadow-sm">
        {EXAMPLES.map((example, idx) => (
          <svg
            aria-label={`baseline-shift: ${value} の例 ${(idx + 1).toString()}`}
            height="56"
            key={example.prefix}
            viewBox={`0 0 ${SVG_WIDTH.toString()} 56`}
            width="100%"
          >
            <line
              className="stroke-border-base"
              strokeDasharray="3 3"
              strokeWidth="1"
              x1="0"
              x2={SVG_WIDTH}
              y1={BASELINE_Y}
              y2={BASELINE_Y}
            />
            <text
              className="fill-fg-base"
              fontSize={FONT_SIZE}
              x="0"
              y={BASELINE_Y}
            >
              {example.prefix}
              <tspan
                className="fill-fg-error"
                fontSize="0.8em"
                fontWeight="bold"
                style={{ baselineShift: value }}
              >
                {example.shifted}
              </tspan>
              {example.suffix}
            </text>
          </svg>
        ))}
      </div>
    </div>
  );
}
