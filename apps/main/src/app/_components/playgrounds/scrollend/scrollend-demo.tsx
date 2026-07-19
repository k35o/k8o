'use client';

import { range } from '@repo/helpers/array/range';
import { useEffect, useRef, useState } from 'react';

export function ScrollendDemo() {
  const [scrollCount, setScrollCount] = useState(0);
  const [scrollendCount, setScrollendCount] = useState(0);
  const [lastScrollendTime, setLastScrollendTime] = useState<string | null>(
    null,
  );
  const scrollRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return undefined;

    const handleScrollend = () => {
      setScrollendCount((prev) => prev + 1);
      setLastScrollendTime(new Date().toLocaleTimeString('ja-JP'));
    };
    element.addEventListener('scrollend', handleScrollend);
    return () => {
      element.removeEventListener('scrollend', handleScrollend);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-fg-mute text-sm">scroll発火:</span>
          <span className="text-fg-info font-bold">{scrollCount}回</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-fg-mute text-sm">scrollend発火:</span>
          <span className="text-primary-fg font-bold">{scrollendCount}回</span>
        </div>
        {lastScrollendTime !== null && (
          <div className="flex items-center gap-2">
            <span className="text-fg-mute text-sm">最終発火:</span>
            <span className="text-sm">{lastScrollendTime}</span>
          </div>
        )}
        <button
          className="bg-bg-mute hover:bg-bg-subtle ml-auto rounded-md px-3 py-1 text-sm"
          onClick={() => {
            setScrollCount(0);
            setScrollendCount(0);
            setLastScrollendTime(null);
          }}
          type="button"
        >
          リセット
        </button>
      </div>

      <section
        aria-label="scrollendイベントを確認するスクロール領域"
        className="bg-bg-mute h-48 overflow-y-scroll rounded-xl p-4"
        onScroll={() => {
          setScrollCount((prev) => prev + 1);
        }}
        ref={scrollRef}
        tabIndex={0}
      >
        <div className="space-y-4">
          {range(0, 20).map((n) => (
            <div
              className="bg-bg-base rounded-md p-3 shadow-sm"
              key={`scrollend-item-${n}`}
            >
              <p className="text-fg-base">アイテム {n + 1}</p>
              <p className="text-fg-mute text-sm">
                スクロールしてscrollendイベントの発火を確認してください
              </p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-fg-mute text-sm">
        上のエリアをスクロールすると、scroll
        イベントは連続して発火しますが、scrollend
        イベントはスクロールが完全に終了したときのみ発火します。
      </p>
    </div>
  );
}
