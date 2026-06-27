'use client';

import { Button } from '@k8o/arte-odyssey';
import { range } from '@repo/helpers/array/range';
import { useEffect, useRef, useState } from 'react';

const FLASH_DURATION_MS = 300;

const useScrollendCounter = () => {
  const [count, setCount] = useState(0);
  const [lastTrigger, setLastTrigger] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    },
    [],
  );

  const trigger = (label: string) => {
    setCount((prev) => prev + 1);
    setLastTrigger(label);
    setShowFlash(true);
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => {
      setShowFlash(false);
    }, FLASH_DURATION_MS);
  };

  const reset = () => {
    setCount(0);
    setLastTrigger(null);
  };

  return { count, lastTrigger, showFlash, trigger, reset };
};

const useScrollendListener = (
  ref: React.RefObject<HTMLElement | null>,
  onScrollend: () => void,
) => {
  const handlerRef = useRef(onScrollend);
  useEffect(() => {
    handlerRef.current = onScrollend;
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    element.tabIndex = 0;
    const handler = () => {
      handlerRef.current();
    };
    element.addEventListener('scrollend', handler);
    return () => {
      element.removeEventListener('scrollend', handler);
    };
  }, [ref]);
};

export function ScrollendTriggerDemo() {
  const { count, lastTrigger, showFlash, trigger, reset } =
    useScrollendCounter();
  const scrollToRef = useRef<HTMLDivElement>(null);
  const snapRef = useRef<HTMLDivElement>(null);

  useScrollendListener(scrollToRef, () => {
    trigger('scrollTo()');
  });
  useScrollendListener(snapRef, () => {
    trigger('scroll-snap');
  });

  return (
    <div className="space-y-4 overflow-hidden">
      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-bg-mute relative flex items-center gap-2 rounded-md px-3 py-1.5">
          <span className="text-fg-mute text-sm">scrollend:</span>
          <span className="text-primary-fg font-bold">{count}</span>
          <span className="text-fg-mute text-sm">回</span>
          {showFlash ? (
            <div className="bg-primary-bg absolute inset-0 rounded-md opacity-30" />
          ) : null}
        </div>
        {lastTrigger !== null && (
          <div className="bg-bg-subtle text-fg-base rounded-md px-3 py-1.5 text-sm">
            {lastTrigger}
          </div>
        )}
        <Button color="gray" onClick={reset} size="sm" variant="outline">
          リセット
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold">scrollTo() API</h4>
            <div className="flex gap-1">
              <Button
                color="primary"
                onClick={() => {
                  scrollToRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                size="sm"
              >
                先頭へ
              </Button>
              <Button
                color="primary"
                onClick={() => {
                  scrollToRef.current?.scrollTo({
                    top: scrollToRef.current.scrollHeight,
                    behavior: 'smooth',
                  });
                }}
                size="sm"
              >
                末尾へ
              </Button>
            </div>
          </div>
          <div
            className="bg-bg-mute h-40 overflow-y-scroll rounded-xl p-3"
            ref={scrollToRef}
          >
            <div className="space-y-2">
              {range(0, 10).map((n) => (
                <div
                  className="bg-bg-base text-fg-base rounded-md px-3 py-2 text-sm shadow-sm"
                  key={`scroll-to-item-${n}`}
                >
                  アイテム {n + 1}
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
            {range(0, 8).map((n) => (
              <div
                className="bg-bg-base flex w-28 shrink-0 snap-center flex-col items-center justify-center gap-2 rounded-lg p-4 shadow-sm"
                key={`snap-item-${n}`}
              >
                <span className="text-primary-fg text-2xl font-bold">
                  {n + 1}
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
