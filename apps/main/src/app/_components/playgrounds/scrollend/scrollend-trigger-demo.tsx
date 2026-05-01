'use client';

import { Button } from '@k8o/arte-odyssey';
import { useCallback, useEffect, useRef, useState } from 'react';

export function ScrollendTriggerDemo() {
  const [scrollendCount, setScrollendCount] = useState(0);
  const [lastTrigger, setLastTrigger] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const scrollToRef = useRef<HTMLDivElement>(null);
  const snapRef = useRef<HTMLDivElement>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScrollendScrollTo = useCallback(() => {
    setScrollendCount((prev) => prev + 1);
    setLastTrigger('scrollTo()');
    setShowFlash(true);
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
    }
    flashTimeoutRef.current = setTimeout(() => {
      setShowFlash(false);
    }, 300);
  }, []);

  const handleScrollendSnap = useCallback(() => {
    setScrollendCount((prev) => prev + 1);
    setLastTrigger('scroll-snap');
    setShowFlash(true);
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
    }
    flashTimeoutRef.current = setTimeout(() => {
      setShowFlash(false);
    }, 300);
  }, []);

  useEffect(
    () => () => {
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const element = scrollToRef.current;
    if (!element) return;

    element.tabIndex = 0;
    element.addEventListener('scrollend', handleScrollendScrollTo);

    return () => {
      element.removeEventListener('scrollend', handleScrollendScrollTo);
    };
  }, [handleScrollendScrollTo]);

  useEffect(() => {
    const element = snapRef.current;
    if (!element) return;

    element.tabIndex = 0;
    element.addEventListener('scrollend', handleScrollendSnap);

    return () => {
      element.removeEventListener('scrollend', handleScrollendSnap);
    };
  }, [handleScrollendSnap]);

  const scrollToTop = useCallback(() => {
    scrollToRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToBottom = useCallback(() => {
    scrollToRef.current?.scrollTo({
      top: scrollToRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, []);

  const resetCounts = useCallback(() => {
    setScrollendCount(0);
    setLastTrigger(null);
  }, []);

  return (
    <div className="space-y-4 overflow-hidden">
      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-bg-mute relative flex items-center gap-2 rounded-md px-3 py-1.5">
          <span className="text-fg-mute text-sm">scrollend:</span>
          <span className="text-primary-fg font-bold">{scrollendCount}</span>
          <span className="text-fg-mute text-sm">回</span>
          {showFlash && (
            <div className="bg-primary-bg absolute inset-0 rounded-md opacity-30" />
          )}
        </div>
        {lastTrigger && (
          <div className="bg-bg-subtle text-fg-base rounded-md px-3 py-1.5 text-sm">
            {lastTrigger}
          </div>
        )}
        <Button color="gray" onClick={resetCounts} size="sm" variant="outlined">
          リセット
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold">scrollTo() API</h4>
            <div className="flex gap-1">
              <Button color="primary" onClick={scrollToTop} size="sm">
                先頭へ
              </Button>
              <Button color="primary" onClick={scrollToBottom} size="sm">
                末尾へ
              </Button>
            </div>
          </div>
          <div
            className="bg-bg-mute h-40 overflow-y-scroll rounded-xl p-3"
            ref={scrollToRef}
          >
            <div className="space-y-2">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  className="bg-bg-base text-fg-base rounded-md px-3 py-2 text-sm shadow-sm"
                  key={i}
                >
                  アイテム {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-2">
          <h4 className="text-sm font-bold">scroll-snap</h4>
          <div
            className="bg-bg-mute flex h-40 snap-x snap-mandatory gap-3 overflow-x-scroll rounded-xl p-3"
            ref={snapRef}
          >
            {Array.from({ length: 8 }, (_, i) => (
              <div
                className="bg-bg-base flex w-28 shrink-0 snap-center flex-col items-center justify-center gap-2 rounded-lg p-4 shadow-sm"
                key={i}
              >
                <span className="text-primary-fg text-2xl font-bold">
                  {i + 1}
                </span>
                <span className="text-fg-mute text-xs">スナップ</span>
              </div>
            ))}
          </div>
          <p className="text-fg-mute text-xs">
            横にスクロールするとスナップします
          </p>
        </div>
      </div>
    </div>
  );
}
