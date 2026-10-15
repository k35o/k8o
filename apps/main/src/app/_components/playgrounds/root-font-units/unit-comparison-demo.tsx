'use client';

import styles from './unit-comparison-demo.module.css';

const SCALE = 4;

export function UnitComparisonDemo() {
  return (
    <div className={styles.root}>
      <div>
        <p className={styles.heading}>幅を測る単位（rch, ric）</p>

        <div className={styles.samples}>
          <div className={styles.widthSample}>
            <span style={{ fontSize: `${SCALE}rem`, lineHeight: 1 }}>水</span>
            <div
              className={styles.bar}
              style={{
                width: `${SCALE}ric`,
                height: '8px',
              }}
            />
            <span className={styles.unitName}>1ric</span>
          </div>

          <div className={styles.widthSample}>
            <span style={{ fontSize: `${SCALE}rem`, lineHeight: 1 }}>0</span>
            <div
              className={styles.bar}
              style={{
                width: `${SCALE}rch`,
                height: '8px',
              }}
            />
            <span className={styles.unitName}>1rch</span>
          </div>
        </div>
      </div>

      <div>
        <p className={styles.heading}>高さを測る単位（rcap, rex）</p>

        <div className={styles.samples}>
          <div className={styles.heightSample}>
            <span style={{ fontSize: `${SCALE}rem`, lineHeight: 1 }}>H</span>
            <div
              className={styles.bar}
              style={{
                width: '8px',
                height: `${SCALE}rcap`,
              }}
            />
            <span
              className={styles.unitName}
              style={{ writingMode: 'vertical-rl' }}
            >
              1rcap
            </span>
          </div>

          <div className={styles.heightSample}>
            <span style={{ fontSize: `${SCALE}rem`, lineHeight: 1 }}>x</span>
            <div
              className={styles.bar}
              style={{
                width: '8px',
                height: `${SCALE}rex`,
              }}
            />
            <span
              className={styles.unitName}
              style={{ writingMode: 'vertical-rl' }}
            >
              1rex
            </span>
          </div>
        </div>
      </div>

      <p className={styles.note}>
        文字と単位バーをそれぞれ{SCALE}倍にしたものを表示しています。
        <br />
        1ricは「水」の幅、1rch は「0」の幅、1rcap
        は大文字Hの高さ、1rexは小文字xの高さです。
      </p>
    </div>
  );
}
