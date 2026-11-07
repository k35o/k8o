import { formatHex } from '@repo/helpers/color/format';
import type { Color } from '@repo/helpers/color/spaces';
import type { FC } from 'react';

import styles from './color-tip.module.css';

const CHECKERBOARD = {
  backgroundImage:
    'repeating-conic-gradient(rgb(128 128 128 / 0.25) 0% 25%, transparent 0% 50%)',
  backgroundSize: '20px 20px',
} as const;

export const ColorTip: FC<{ color: Color }> = ({ color }) => {
  const css = formatHex(color);
  // テキストのコントラストは不透明な色を基準にする。
  const opaque = formatHex({ ...color, alpha: 1 });

  return (
    <div className={styles.root}>
      <div className={styles.checkerboard} style={CHECKERBOARD} />
      <div className={styles.swatch} style={{ backgroundColor: css }}>
        <p
          className={styles.code}
          style={{ color: `contrast-color(${opaque})` }}
        >
          {css}
        </p>
      </div>
    </div>
  );
};
