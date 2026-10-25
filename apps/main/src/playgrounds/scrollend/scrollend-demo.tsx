'use client';

import { range } from '@repo/helpers/array/range';
import { useState } from 'react';

import styles from './scrollend-demo.module.css';

export function ScrollendDemo() {
  const [scrollCount, setScrollCount] = useState(0);
  const [scrollendCount, setScrollendCount] = useState(0);
  const [lastScrollendTime, setLastScrollendTime] = useState<string | null>(
    null,
  );

  return (
    <div className={styles.root}>
      <div className={styles.status}>
        <div className={styles.counter}>
          <span className={styles.label}>scroll発火:</span>
          <span className={styles.scrollCount}>{scrollCount}回</span>
        </div>
        <div className={styles.counter}>
          <span className={styles.label}>scrollend発火:</span>
          <span className={styles.scrollendCount}>{scrollendCount}回</span>
        </div>
        {lastScrollendTime !== null && (
          <div className={styles.counter}>
            <span className={styles.label}>最終発火:</span>
            <span className={styles.time}>{lastScrollendTime}</span>
          </div>
        )}
        <button
          className={styles.reset}
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
        className={styles.scroller}
        onScroll={() => {
          setScrollCount((prev) => prev + 1);
        }}
        onScrollEnd={() => {
          setScrollendCount((prev) => prev + 1);
          setLastScrollendTime(new Date().toLocaleTimeString('ja-JP'));
        }}
        tabIndex={0}
      >
        <div className={styles.list}>
          {range(0, 20).map((n) => (
            <div className={styles.item} key={`scrollend-item-${n}`}>
              <p className={styles.itemTitle}>アイテム {n + 1}</p>
              <p className={styles.itemText}>
                スクロールしてscrollendイベントの発火を確認してください
              </p>
            </div>
          ))}
        </div>
      </section>

      <p className={styles.note}>
        上のエリアをスクロールすると、scroll
        イベントは連続して発火しますが、scrollend
        イベントはスクロールが完全に終了したときのみ発火します。
      </p>
    </div>
  );
}
