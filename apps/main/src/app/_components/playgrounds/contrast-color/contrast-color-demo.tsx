'use client';

import { FormControl, TextField } from '@k8o/arte-odyssey';
import { useState } from 'react';

const isHexColor = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value);

export function ContrastColorDemo() {
  const [backgroundColor, setBackgroundColor] = useState('#2563eb');

  return (
    <div className="flex flex-col gap-6">
      <FormControl
        label="背景色"
        renderInput={({ labelId: _, ...props }) => (
          <div className="flex items-center gap-3">
            <label
              className="border-border-base relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-full border-2"
              style={{
                backgroundColor: isHexColor(backgroundColor)
                  ? backgroundColor
                  : '#2563eb',
              }}
            >
              <input
                aria-label="カラーピッカー"
                className="absolute inset-0 size-full cursor-pointer opacity-0"
                onChange={(e) => {
                  setBackgroundColor(e.target.value);
                }}
                type="color"
                value={
                  isHexColor(backgroundColor) ? backgroundColor : '#2563eb'
                }
              />
            </label>
            <TextField
              onChange={(e) => {
                setBackgroundColor(e.currentTarget.value);
              }}
              value={backgroundColor}
              {...props}
            />
          </div>
        )}
      />

      <div
        className="flex h-40 items-center justify-center rounded-xl p-8 text-xl font-bold shadow-sm"
        style={{
          backgroundColor,
          color: `contrast-color(${backgroundColor})`,
        }}
      >
        この文字色は contrast-color() で決まっています
      </div>

      <div className="bg-bg-subtle rounded-xl p-4">
        <p className="font-mono text-sm">
          color: contrast-color({backgroundColor})&#x3B;
        </p>
      </div>
    </div>
  );
}
