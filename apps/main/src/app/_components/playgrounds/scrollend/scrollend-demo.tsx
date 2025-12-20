'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * scrollendイベントのデモ
 * スクロール可能なコンテナでscrollendイベントの発火を確認できる
 */
export function ScrollendDemo() {
  const [scrollCount, setScrollCount] = useState(0);
  const [scrollendCount, setScrollendCount] = useState(0);
  const [lastScrollendTime, setLastScrollendTime] = useState<string | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    setScrollCount((prev) => prev + 1);
  }, []);

  const handleScrollend = useCallback(() => {
    setScrollendCount((prev) => prev + 1);
    setLastScrollendTime(new Date().toLocaleTimeString('ja-JP'));
  }, []);

  const resetCounts = useCallback(() => {
    setScrollCount(0);
    setScrollendCount(0);
    setLastScrollendTime(null);
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.tabIndex = 0;
    element.addEventListener('scroll', handleScroll);
    element.addEventListener('scrollend', handleScrollend);

    return () => {
      element.removeEventListener('scroll', handleScroll);
      element.removeEventListener('scrollend', handleScrollend);
    };
  }, [handleScroll, handleScrollend]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-fg-mute text-sm">scroll発火:</span>
          <span className="font-bold text-fg-info">{scrollCount}回</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-fg-mute text-sm">scrollend発火:</span>
          <span className="font-bold text-primary-fg">{scrollendCount}回</span>
        </div>
        {lastScrollendTime && (
          <div className="flex items-center gap-2">
            <span className="text-fg-mute text-sm">最終発火:</span>
            <span className="text-sm">{lastScrollendTime}</span>
          </div>
        )}
        <button
          className="ml-auto rounded-md bg-bg-mute px-3 py-1 text-sm hover:bg-bg-subtle"
          onClick={resetCounts}
          type="button"
        >
          リセット
        </button>
      </div>

      <div
        className="h-48 overflow-y-scroll rounded-lg border border-border-base bg-bg-mute p-4"
        ref={scrollRef}
      >
        <div className="space-y-4">
          {Array.from({ length: 20 }, (_, i) => (
            <div className="rounded-md bg-bg-base p-3 shadow-sm" key={i}>
              <p className="text-fg-base">アイテム {i + 1}</p>
              <p className="text-fg-mute text-sm">
                スクロールしてscrollendイベントの発火を確認してください
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-fg-mute text-sm">
        上のエリアをスクロールすると、scroll
        イベントは連続して発火しますが、scrollend
        イベントはスクロールが完全に終了したときのみ発火します。
      </p>
    </div>
  );
}
