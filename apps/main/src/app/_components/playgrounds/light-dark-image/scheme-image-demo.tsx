'use client';

import { Code, Radio } from '@k8ordo/ui';
import { useId, useState } from 'react';

const schemeOptions = [
  { value: 'light dark', label: 'light dark（OSの設定に従う）' },
  { value: 'light', label: 'light' },
  { value: 'dark', label: 'dark' },
] as const;

type Scheme = (typeof schemeOptions)[number]['value'];

const isScheme = (value: string): value is Scheme =>
  schemeOptions.some((option) => option.value === value);

export function SchemeImageDemo() {
  const [scheme, setScheme] = useState<Scheme>('light dark');
  const labelId = useId();

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        .ldi-box {
          background-image: light-dark(
            linear-gradient(135deg, oklch(92% 0.06 250), oklch(68% 0.16 250)),
            radial-gradient(circle at 50% 50%, oklch(65% 0.15 250), oklch(15% 0.02 250) 60%)
          );
        }
      `}</style>

      <div className="flex flex-col gap-2">
        <p className="text-fg-base text-sm font-bold" id={labelId}>
          枠の<Code>color-scheme</Code>
        </p>
        <Radio
          aria-labelledby={labelId}
          name={`ldi-scheme-${labelId}`}
          onChange={(value) => {
            if (isScheme(value)) {
              setScheme(value);
            }
          }}
          options={schemeOptions}
          value={scheme}
        />
      </div>

      <div
        aria-hidden="true"
        className="ldi-box h-40 rounded-xl"
        style={{ colorScheme: scheme }}
      />

      <p className="text-fg-mute text-sm">
        枠の<Code>background-image</Code>には、<Code>light-dark()</Code>
        に直線グラデーションと放射状グラデーションを渡しています。ライトは斜めの直線、ダークは中心が明るい放射状で、
        <Code>light dark</Code>ではOSの設定に従います。
      </p>
    </div>
  );
}
