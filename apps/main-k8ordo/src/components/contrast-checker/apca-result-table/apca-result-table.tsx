import { AlertIcon } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';

import styles from './apca-result-table.module.css';

type Props = {
  lc: number;
};

const APCA_LEVELS = [
  {
    threshold: 90,
    usage: '本文テキスト（推奨）',
    example: '長文の本文や14px程度の小さな文字',
  },
  {
    threshold: 75,
    usage: '本文テキストの最低基準',
    example: '18px程度の本文',
  },
  {
    threshold: 60,
    usage: '本文以外のテキストの最低基準',
    example: '24px程度の大きめのテキストや16pxの太字',
  },
  {
    threshold: 45,
    usage: '大きなテキストの最低基準',
    example: '36px以上の見出しや24px程度の太字',
  },
  {
    threshold: 30,
    usage: 'あらゆるテキストの下限',
    example: 'プレースホルダーや無効状態の文字を含む',
  },
  {
    threshold: 15,
    usage: '非テキスト要素の下限',
    example: 'アイコンや境界線など意味を持つ要素',
  },
] as const;

const Status: FC<{ isInvalid: boolean }> = ({ isInvalid }) =>
  isInvalid ? (
    <div className={cn(styles.status, styles.ng)}>
      <AlertIcon size="sm" status="error" />
      <span className={styles.statusLabel}>NG</span>
    </div>
  ) : (
    <div className={cn(styles.status, styles.ok)}>
      <AlertIcon size="sm" status="success" />
      <span className={styles.statusLabel}>OK</span>
    </div>
  );

export const ApcaResultTable: FC<Props> = ({ lc }) => {
  // APCAのLcは正負で文字と背景の明暗関係を表すため、判定には絶対値を使う
  const absLc = Math.abs(lc);

  return (
    <div className={styles.root}>
      <div className={styles.cards}>
        {APCA_LEVELS.map((level) => (
          <div className={styles.card} key={level.threshold}>
            <div className={styles.cardHeader}>
              <p className={styles.cardThreshold}>Lc {level.threshold}以上</p>
              <Status isInvalid={absLc < level.threshold} />
            </div>
            <p className={styles.cardUsage}>{level.usage}</p>
            <p className={styles.cardExample}>{level.example}</p>
          </div>
        ))}
      </div>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headRow}>
            <th className={styles.headCell} scope="col">
              判定
            </th>
            <th className={styles.headCell} scope="col">
              基準
            </th>
            <th className={cn(styles.headCell, styles.alignStart)} scope="col">
              用途
            </th>
          </tr>
        </thead>
        <tbody>
          {APCA_LEVELS.map((level) => (
            <tr className={styles.row} key={level.threshold}>
              <td className={styles.statusCell}>
                <Status isInvalid={absLc < level.threshold} />
              </td>
              <td className={styles.thresholdCell}>Lc {level.threshold}以上</td>
              <td className={styles.usageCell}>
                <p className={styles.usage}>{level.usage}</p>
                <p className={styles.example}>{level.example}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
