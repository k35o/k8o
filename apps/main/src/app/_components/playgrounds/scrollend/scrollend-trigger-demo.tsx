'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useRef, useState } from 'react';

/**
 * scrollendイベントの発火条件デモ
 * scrollTo()やscroll-snapによる発火を確認できる
 */
export function ScrollendTriggerDemo() {
  const [scrollendCount, setScrollendCount] = useState(0);
  const [lastTrigger, setLastTrigger] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const scrollToRef = useRef<HTMLDivElement>(null);
  const snapRef = useRef<HTMLDivElement>(null);

  const handleScrollend = useCallback((trigger: string) => {
    return () => {
      setScrollendCount((prev) => prev + 1);
      setLastTrigger(trigger);
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 300);
    };
  }, []);

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
        <div className="relative flex items-center gap-2 rounded-md bg-bg-mute px-3 py-1.5">
          <span className="text-fg-mute text-sm">scrollend:</span>
          <AnimatePresence mode="popLayout">
            <motion.span
              animate={{ scale: 1 }}
              className="font-bold text-primary-fg"
              initial={{ scale: 1.2 }}
              key={scrollendCount}
            >
              {scrollendCount}
            </motion.span>
          </AnimatePresence>
          <span className="text-fg-mute text-sm">回</span>
          {showFlash && (
            <motion.div
              animate={{ opacity: 0 }}
              className="absolute inset-0 rounded-md bg-primary-bg"
              initial={{ opacity: 0.3 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>
        {lastTrigger && (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="rounded-md bg-bg-subtle px-3 py-1.5 text-fg-base text-sm"
            initial={{ opacity: 0, x: -10 }}
          >
            {lastTrigger}
          </motion.div>
        )}
        <Button color="gray" onClick={resetCounts} size="sm" variant="outlined">
          リセット
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm">scrollTo() API</h4>
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
            className="h-40 overflow-y-scroll rounded-lg border border-border-base bg-bg-mute p-3"
            onScrollEnd={handleScrollend('scrollTo()')}
            ref={scrollToRef}
          >
            <div className="space-y-2">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  className="rounded-md bg-bg-base px-3 py-2 text-fg-base text-sm shadow-sm"
                  key={i}
                >
                  アイテム {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-2">
          <h4 className="font-bold text-sm">scroll-snap</h4>
          <div
            className="flex h-40 snap-x snap-mandatory gap-3 overflow-x-scroll rounded-lg border border-border-base bg-bg-mute p-3"
            onScrollEnd={handleScrollend('scroll-snap')}
            ref={snapRef}
          >
            {Array.from({ length: 8 }, (_, i) => (
              <div
                className="flex w-28 shrink-0 snap-center flex-col items-center justify-center gap-2 rounded-lg bg-bg-base p-4 shadow-sm"
                key={i}
              >
                <span className="font-bold text-2xl text-primary-fg">
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
