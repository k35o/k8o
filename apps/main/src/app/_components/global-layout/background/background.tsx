import type { FC } from 'react';

import styles from './background.module.css';

type Dot = { cx: number; cy: number; r: number };

// 左上の足（多め・大きめ）。viewBox 0 0 240 240。
const legPathsTopLeft = [
  'M 6 -16 C 36 36, 18 86, 70 116 C 104 135, 92 182, 138 196',
  'M -16 26 C 40 44, 72 78, 72 124 C 72 158, 104 176, 116 208',
  'M -8 72 C 28 80, 44 104, 40 140 C 38 162, 52 176, 70 186',
];

const dotsTopLeft: Dot[] = [
  { cx: 58, cy: 104, r: 2 },
  { cx: 84, cy: 142, r: 2 },
  { cx: 112, cy: 180, r: 2 },
  { cx: 72, cy: 126, r: 1.8 },
  { cx: 104, cy: 176, r: 1.8 },
  { cx: 42, cy: 140, r: 1.8 },
  { cx: 60, cy: 182, r: 1.6 },
];

// 右下の足（左上とは別カーブ・少なめ）。左右で非対称にする。
const legPathsBottomRight = [
  'M -10 12 C 52 32, 30 92, 80 126 C 112 148, 98 198, 134 216',
  'M -6 52 C 32 72, 50 112, 46 152 C 43 186, 62 202, 82 216',
];

const dotsBottomRight: Dot[] = [
  { cx: 62, cy: 108, r: 1.8 },
  { cx: 96, cy: 160, r: 1.8 },
  { cx: 50, cy: 150, r: 1.6 },
];

const Legs: FC<{ paths: string[]; dots: Dot[] }> = ({ paths, dots }) => (
  <svg viewBox="0 0 240 240" fill="none" aria-hidden="true">
    <g className={styles['leg']}>
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
    <g className={styles['dot']}>
      {dots.map((dot) => (
        <circle key={`${dot.cx}-${dot.cy}`} cx={dot.cx} cy={dot.cy} r={dot.r} />
      ))}
    </g>
  </svg>
);

export const Background: FC = () => (
  <div aria-hidden="true" className={styles['background']}>
    <div className={`${styles['corner']} ${styles['topLeft']}`}>
      <Legs paths={legPathsTopLeft} dots={dotsTopLeft} />
    </div>
    <div className={`${styles['corner']} ${styles['bottomRight']}`}>
      <Legs paths={legPathsBottomRight} dots={dotsBottomRight} />
    </div>
    <div className={styles['grain']} />
  </div>
);
