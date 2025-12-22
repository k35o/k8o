'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * scrollbar-colorプロパティのデモ
 * スクロールバーの色をカスタマイズできることを確認できる
 */
export function ScrollbarColorDemo() {
  const [thumbColor, setThumbColor] = useState('#6366f1');
  const [trackColor, setTrackColor] = useState('#e2e8f0');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.tabIndex = 0;
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-fg-mute text-sm" htmlFor="thumb-color">
            つまみ（thumb）:
          </label>
          <input
            className="h-8 w-16 cursor-pointer rounded border border-border-base"
            id="thumb-color"
            onChange={(e) => setThumbColor(e.target.value)}
            type="color"
            value={thumbColor}
          />
          <span className="font-mono text-sm">{thumbColor}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-fg-mute text-sm" htmlFor="track-color">
            トラック（track）:
          </label>
          <input
            className="h-8 w-16 cursor-pointer rounded border border-border-base"
            id="track-color"
            onChange={(e) => setTrackColor(e.target.value)}
            type="color"
            value={trackColor}
          />
          <span className="font-mono text-sm">{trackColor}</span>
        </div>
      </div>

      <div
        className="h-48 overflow-y-scroll rounded-lg border border-border-base bg-bg-mute p-4"
        ref={scrollRef}
        style={{
          scrollbarColor: `${thumbColor} ${trackColor}`,
        }}
      >
        <div className="space-y-4">
          {Array.from({ length: 20 }, (_, i) => (
            <div className="rounded-md bg-bg-base p-3 shadow-sm" key={i}>
              <p className="text-fg-base">アイテム {i + 1}</p>
              <p className="text-fg-mute text-sm">
                スクロールバーの色が変わっていることを確認してください
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md bg-bg-subtle p-3">
        <p className="font-mono text-sm">
          scrollbar-color: {thumbColor} {trackColor}&#x3B;
        </p>
      </div>
    </div>
  );
}
