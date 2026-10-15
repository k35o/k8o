import type { FC } from 'react';

import type { PaletteSwatch } from '../../_types/palette';

import styles from './palette-preview.module.css';

type Props = {
  swatches: readonly PaletteSwatch[];
};

const readableTextColor = (swatch: PaletteSwatch): string =>
  swatch.readableText === 'white' ? '#ffffff' : '#000000';

const readableContrast = (swatch: PaletteSwatch): number =>
  swatch.readableText === 'white' ? swatch.contrastWhite : swatch.contrastBlack;

export const PalettePreview: FC<Props> = ({ swatches }) => {
  const hasClamped = swatches.some((swatch) => swatch.isClamped);

  return (
    <div className={styles.root}>
      <div className={styles.swatches}>
        {swatches.map((swatch) => (
          <div className={styles.swatch} key={swatch.step}>
            <div
              className={styles.chip}
              style={{ backgroundColor: swatch.hex }}
            >
              <span
                className={styles.step}
                style={{ color: readableTextColor(swatch) }}
              >
                {swatch.step}
              </span>
              <span
                className={styles.contrast}
                style={{ color: readableTextColor(swatch) }}
              >
                {readableContrast(swatch).toFixed(2)}
              </span>
            </div>
            <p className={styles.hex}>
              {swatch.hex}
              {swatch.isClamped ? '＊' : ''}
            </p>
          </div>
        ))}
      </div>
      {/* 表示/非表示でレイアウトが動かないよう、行の高さは常に確保する */}
      <p className={styles.note} data-visible={hasClamped}>
        ＊はsRGB色域に収めるため彩度を自動調整した段です
      </p>
    </div>
  );
};
