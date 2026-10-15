import { AlertIcon } from '@k8ordo/ui';
import type { FC } from 'react';

import type { PaletteSwatch } from '../../_types/palette';

import styles from './contrast-table.module.css';

type Props = {
  swatches: readonly PaletteSwatch[];
};

const AA_NORMAL_TEXT = 4.5;

type ContrastValueProps = {
  hex: string;
  text: 'white' | 'black';
  ratio: number;
  apca: number;
};

const ContrastValue: FC<ContrastValueProps> = ({ hex, text, ratio, apca }) => {
  const isPass = ratio >= AA_NORMAL_TEXT;

  return (
    <div className={styles.value}>
      <span
        aria-hidden="true"
        className={styles.sample}
        style={{
          backgroundColor: hex,
          color: text === 'white' ? '#ffffff' : '#000000',
        }}
      >
        Aa
      </span>
      <div className={styles.scores}>
        {/* 合否を色だけに頼らず、アイコン(形)と読み上げテキストでも伝える */}
        <span className={styles.ratio} data-pass={isPass}>
          <AlertIcon size="sm" status={isPass ? 'success' : 'error'} />
          {ratio.toFixed(2)}
          <span className={styles.srOnly}>
            {isPass ? '（AA合格）' : '（AA不合格）'}
          </span>
        </span>
        <span className={styles.apca}>Lc {apca.toFixed(1)}</span>
      </div>
    </div>
  );
};

export const ContrastTable: FC<Props> = ({ swatches }) => (
  <div className={styles.root}>
    <div className={styles.frame}>
      <div className={styles.cards}>
        {swatches.map((swatch) => (
          <div className={styles.card} key={swatch.step}>
            <div className={styles.cardHeader}>
              <span
                aria-hidden="true"
                className={styles.swatch}
                style={{ backgroundColor: swatch.hex }}
              />
              <span className={styles.step}>{swatch.step}</span>
              <span className={styles.hex}>{swatch.hex}</span>
            </div>
            <div className={styles.cardScores}>
              <div className={styles.cardScore}>
                <span className={styles.cardLabel}>白文字</span>
                <ContrastValue
                  apca={swatch.apcaWhite}
                  hex={swatch.hex}
                  ratio={swatch.contrastWhite}
                  text="white"
                />
              </div>
              <div className={styles.cardScore}>
                <span className={styles.cardLabel}>黒文字</span>
                <ContrastValue
                  apca={swatch.apcaBlack}
                  hex={swatch.hex}
                  ratio={swatch.contrastBlack}
                  text="black"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headRow}>
            <th className={styles.headCell} scope="col">
              段
            </th>
            <th className={styles.headCell} scope="col">
              色
            </th>
            <th className={styles.headCell} scope="col">
              OKLCH
            </th>
            <th className={styles.headCell} scope="col">
              白文字
            </th>
            <th className={styles.headCell} scope="col">
              黒文字
            </th>
          </tr>
        </thead>
        <tbody>
          {swatches.map((swatch) => (
            <tr className={styles.row} key={swatch.step}>
              <td className={styles.stepCell}>{swatch.step}</td>
              <td className={styles.monoCell}>
                <span
                  aria-hidden="true"
                  className={styles.inlineSwatch}
                  style={{ backgroundColor: swatch.hex }}
                />
                {swatch.hex}
              </td>
              <td className={styles.monoCell}>{swatch.cssOklch}</td>
              <td className={styles.cell}>
                <ContrastValue
                  apca={swatch.apcaWhite}
                  hex={swatch.hex}
                  ratio={swatch.contrastWhite}
                  text="white"
                />
              </td>
              <td className={styles.cell}>
                <ContrastValue
                  apca={swatch.apcaBlack}
                  hex={swatch.hex}
                  ratio={swatch.contrastBlack}
                  text="black"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <p className={styles.note}>
      WCAG比は4.5以上（通常テキストのAA基準）を合格とし、色とアイコンで示しています
    </p>
  </div>
);
