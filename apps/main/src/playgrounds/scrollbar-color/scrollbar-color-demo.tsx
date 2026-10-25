'use client';

import { range } from '@repo/helpers/array/range';
import { useState } from 'react';

import styles from './scrollbar-color-demo.module.css';

export function ScrollbarColorDemo() {
  const [thumbColor, setThumbColor] = useState('#6366f1');
  const [trackColor, setTrackColor] = useState('#e2e8f0');

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        <div className={styles.control}>
          <label className={styles.label} htmlFor="thumb-color">
            つまみ（thumb）:
          </label>
          <input
            className={styles.colorInput}
            id="thumb-color"
            onChange={(e) => {
              setThumbColor(e.target.value);
            }}
            type="color"
            value={thumbColor}
          />
          <span className={styles.value}>{thumbColor}</span>
        </div>
        <div className={styles.control}>
          <label className={styles.label} htmlFor="track-color">
            トラック（track）:
          </label>
          <input
            className={styles.colorInput}
            id="track-color"
            onChange={(e) => {
              setTrackColor(e.target.value);
            }}
            type="color"
            value={trackColor}
          />
          <span className={styles.value}>{trackColor}</span>
        </div>
      </div>

      <div
        className={styles.scroller}
        style={{
          scrollbarColor: `${thumbColor} ${trackColor}`,
        }}
        tabIndex={0}
      >
        <div className={styles.list}>
          {range(0, 20).map((n) => (
            <div className={styles.item} key={`scrollbar-item-${n}`}>
              <p className={styles.itemTitle}>アイテム {n + 1}</p>
              <p className={styles.itemText}>
                スクロールバーの色が変わっていることを確認してください
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className={styles.output}>
          scrollbar-color: {thumbColor} {trackColor}&#x3B;
        </p>
      </div>
    </div>
  );
}
