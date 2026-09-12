'use client';

import { Code, FormControl, Slider } from '@k8ordo/ui';
import { useState } from 'react';

export function FluidFontSizeDemo() {
  const [width, setWidth] = useState(800);

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        /* 2vw を画面幅に見立てた値の 2% に置き換えて、clamp() 版の一次式をそのまま再現する */
        .pf-fluid-clamp {
          font-size: clamp(1rem, 0.5rem + var(--width) * 0.02, 2rem);
        }
        .pf-fluid-progress {
          font-size: calc(1rem + progress(var(--width), 400px, 1200px) * 1rem);
        }
      `}</style>

      <FormControl
        helpText="400pxより狭ければ1rem、1200pxより広ければ2remで止まります"
        label={`画面幅に見立てた値: ${String(width)}px`}
        renderInput={({ 'aria-labelledby': _ariaLabelledby, ...props }) => (
          <Slider
            {...props}
            max={1400}
            min={200}
            onChange={setWidth}
            step={10}
            value={width}
          />
        )}
      />

      <div
        className="pf-fluid flex flex-col gap-4"
        style={{ '--width': `${String(width)}px` }}
      >
        <div className="bg-bg-subtle flex flex-col gap-1 rounded-lg p-4">
          <Code>clamp(1rem, 0.5rem + 2vw, 2rem)</Code>
          <p className="pf-fluid-clamp text-fg-base leading-tight font-bold transition-[font-size] duration-150">
            見出しのサンプル
          </p>
        </div>
        <div className="bg-bg-subtle flex flex-col gap-1 rounded-lg p-4">
          <Code>calc(1rem + progress(100vw, 400px, 1200px) * 1rem)</Code>
          <p className="pf-fluid-progress text-fg-base leading-tight font-bold transition-[font-size] duration-150">
            見出しのサンプル
          </p>
        </div>
      </div>

      <p className="text-fg-mute text-sm">
        実際の画面幅の代わりに、スライダーの値を<Code>--width</Code>
        として両方の式に渡しています。上は逆算した係数で書いた一次式、下は
        <Code>progress()</Code>
        で両端をそのまま書いた式で、どの幅でも同じ大きさになります。
      </p>
    </div>
  );
}
