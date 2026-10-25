'use client';

import { Button } from '@k8ordo/ui';
import { range } from '@repo/helpers/array/range';
import { useEffect, useRef, useState } from 'react';

import styles from './scrollend-trigger-demo.module.css';

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
    setShowFlash(false);
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = null;
    }
  };

  return { count, lastTrigger, showFlash, trigger, reset };
};

export function ScrollendTriggerDemo() {
  const { count, lastTrigger, showFlash, trigger, reset } =
    useScrollendCounter();
  const scrollToRef = useRef<HTMLElement>(null);

  return (
    <div className={styles.root}>
      <div className={styles.status}>
        <div className={styles.counter}>
          <span className={styles.label}>scrollend:</span>
          <span className={styles.count}>{count}</span>
          <span className={styles.label}>回</span>
          {showFlash ? <div className={styles.flash} /> : null}
        </div>
        {lastTrigger !== null && (
          <div className={styles.lastTrigger}>{lastTrigger}</div>
        )}
        <Button color="base" onClick={reset} size="sm" variant="outline">
          リセット
        </Button>
      </div>

      <div className={styles.grid}>
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <h4 className={styles.heading}>scrollTo() API</h4>
            <div className={styles.actions}>
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
          <section
            aria-label="scrollTo()でスクロールする領域"
            className={styles.scroller}
            onScrollEnd={() => {
              trigger('scrollTo()');
            }}
            ref={scrollToRef}
            tabIndex={0}
          >
            <div className={styles.list}>
              {range(0, 10).map((n) => (
                <div className={styles.item} key={`scroll-to-item-${n}`}>
                  アイテム {n + 1}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.column}>
          <h4 className={styles.heading}>scroll-snap</h4>
          <section
            aria-label="scroll-snapで横スクロールする領域"
            className={styles.snapScroller}
            onScrollEnd={() => {
              trigger('scroll-snap');
            }}
            tabIndex={0}
          >
            {range(0, 8).map((n) => (
              <div className={styles.snapItem} key={`snap-item-${n}`}>
                <span className={styles.snapNumber}>{n + 1}</span>
                <span className={styles.snapLabel}>スナップ</span>
              </div>
            ))}
          </section>
          <p className={styles.note}>横にスクロールするとスナップします</p>
        </div>
      </div>
    </div>
  );
}
