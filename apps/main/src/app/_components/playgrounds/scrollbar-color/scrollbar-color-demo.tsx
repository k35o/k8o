'use client';

import { range } from '@repo/helpers/array/range';
import { useState } from 'react';

export function ScrollbarColorDemo() {
  const [thumbColor, setThumbColor] = useState('#6366f1');
  const [trackColor, setTrackColor] = useState('#e2e8f0');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label
            className="text-fg-mute text-sm"
            htmlFor="thumb-color"
            id="thumb-color-label"
          >
            つまみ（thumb）:
          </label>
          <input
            aria-labelledby="thumb-color-label"
            className="border-border-base h-8 w-16 cursor-pointer rounded border"
            id="thumb-color"
            onChange={(e) => {
              setThumbColor(e.target.value);
            }}
            type="color"
            value={thumbColor}
          />
          <span className="font-mono text-sm">{thumbColor}</span>
        </div>
        <div className="flex items-center gap-2">
          <label
            className="text-fg-mute text-sm"
            htmlFor="track-color"
            id="track-color-label"
          >
            トラック（track）:
          </label>
          <input
            aria-labelledby="track-color-label"
            className="border-border-base h-8 w-16 cursor-pointer rounded border"
            id="track-color"
            onChange={(e) => {
              setTrackColor(e.target.value);
            }}
            type="color"
            value={trackColor}
          />
          <span className="font-mono text-sm">{trackColor}</span>
        </div>
      </div>

      <div
        className="border-border-base bg-bg-mute h-48 overflow-y-scroll rounded-lg border p-4"
        style={{
          scrollbarColor: `${thumbColor} ${trackColor}`,
        }}
        tabIndex={0}
      >
        <div className="space-y-4">
          {range(0, 20).map((n) => (
            <div
              className="bg-bg-base rounded-md p-3 shadow-sm"
              key={`scrollbar-item-${n}`}
            >
              <p className="text-fg-base">アイテム {n + 1}</p>
              <p className="text-fg-mute text-sm">
                スクロールバーの色が変わっていることを確認してください
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-bg-subtle rounded-md p-3">
        <p className="font-mono text-sm">
          scrollbar-color: {thumbColor} {trackColor}&#x3B;
        </p>
      </div>
    </div>
  );
}
