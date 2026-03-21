'use client';

import { FormControl, Slider } from '@k8o/arte-odyssey';
import { useState } from 'react';

export function ShapeFunctionDemo() {
  const [width, setWidth] = useState(100);

  return (
    <div className="space-y-6">
      <FormControl
        label="幅"
        renderInput={({ labelId: _, ...props }) => (
          <Slider
            {...props}
            max={100}
            min={30}
            onChange={setWidth}
            value={width}
          />
        )}
      />

      <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
        <div className="flex-1 space-y-2">
          <p className="font-bold text-fg-base text-sm">path()</p>
          <div
            className="overflow-hidden rounded-md bg-bg-mute"
            style={{ width: `${width}%` }}
          >
            <div
              className="h-32 bg-linear-to-br from-group-secondary to-group-quaternary"
              style={{
                clipPath: "path('M 0 0 L 200 64 L 0 128 Z')",
              }}
            />
          </div>
          <p className="text-fg-mute text-xs">
            固定のピクセル値のため、幅を変えると三角形が崩れる
          </p>
        </div>

        <div className="flex-1 space-y-2">
          <p className="font-bold text-fg-base text-sm">shape()</p>
          <div
            className="overflow-hidden rounded-md bg-bg-mute"
            style={{ width: `${width}%` }}
          >
            <div
              className="h-32 bg-linear-to-br from-group-secondary to-group-quaternary"
              style={{
                clipPath:
                  'shape(from 0% 0%, line to 100% 50%, line to 0% 100%, close)',
              }}
            />
          </div>
          <p className="text-fg-mute text-xs">
            パーセンテージのため、幅を変えても三角形を維持する
          </p>
        </div>
      </div>
    </div>
  );
}
