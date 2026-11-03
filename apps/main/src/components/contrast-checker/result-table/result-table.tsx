import { AlertIcon } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';

import styles from './result-table.module.css';

type Props = {
  isInvalidAaLargeText: boolean;
  isInvalidAaaLargeText: boolean;
  isInvalidAaNormalText: boolean;
  isInvalidAaaNormalText: boolean;
  compareColor: string;
  baseColor: string;
};

type StatusCellProps = {
  isInvalid: boolean;
};

const StatusCell: FC<StatusCellProps> = ({ isInvalid }) => (
  <td className={styles.statusCell}>
    {isInvalid ? (
      <div className={cn(styles.status, styles.ng)}>
        <AlertIcon size="sm" status="error" />
        <span className={styles.statusLabel}>NG</span>
      </div>
    ) : (
      <div className={cn(styles.status, styles.ok)}>
        <AlertIcon size="sm" status="success" />
        <span className={styles.statusLabel}>OK</span>
      </div>
    )}
  </td>
);

const StatusBadge: FC<StatusCellProps & { label: string }> = ({
  isInvalid,
  label,
}) => (
  <div className={styles.badge}>
    <span className={styles.badgeLabel}>{label}</span>
    {isInvalid ? (
      <div className={cn(styles.badgeStatus, styles.ng)}>
        <AlertIcon size="sm" status="error" />
        <span className={styles.badgeStatusLabel}>NG</span>
      </div>
    ) : (
      <div className={cn(styles.badgeStatus, styles.ok)}>
        <AlertIcon size="sm" status="success" />
        <span className={styles.badgeStatusLabel}>OK</span>
      </div>
    )}
  </div>
);

export const ResultTable: FC<Props> = ({
  isInvalidAaLargeText,
  isInvalidAaaLargeText,
  isInvalidAaNormalText,
  isInvalidAaaNormalText,
  compareColor,
  baseColor,
}) => {
  const rows = [
    {
      aa: isInvalidAaLargeText,
      aaa: isInvalidAaaLargeText,
      sampleClass: styles.largeBold,
      label: '大文字の太字のテキスト（18.66px bold）',
    },
    {
      aa: isInvalidAaLargeText,
      aaa: isInvalidAaaLargeText,
      sampleClass: styles.large,
      label: '大文字のテキスト（24px）',
    },
    {
      aa: isInvalidAaNormalText,
      aaa: isInvalidAaaNormalText,
      sampleClass: styles.normalBold,
      label: '小文字の太字のテキスト（16px bold）',
    },
    {
      aa: isInvalidAaNormalText,
      aaa: isInvalidAaaNormalText,
      sampleClass: styles.normal,
      label: '小文字のテキスト（18.66px）',
    },
  ] as const;

  return (
    <div className={styles.root}>
      <div className={styles.cards}>
        {rows.map((row) => (
          <div className={styles.card} key={row.label}>
            <p
              className={cn(styles.sample, row.sampleClass)}
              style={{
                color: compareColor,
                backgroundColor: baseColor,
              }}
            >
              {row.label}
            </p>
            <div className={styles.badges}>
              <StatusBadge isInvalid={row.aa} label="AA" />
              <StatusBadge isInvalid={row.aaa} label="AAA" />
            </div>
          </div>
        ))}
      </div>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headRow}>
            <th className={styles.headCell} scope="col">
              AA
            </th>
            <th className={styles.headCell} scope="col">
              AAA
            </th>
            <th className={cn(styles.headCell, styles.alignStart)} scope="col">
              テキスト
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className={styles.row} key={row.label}>
              <StatusCell isInvalid={row.aa} />
              <StatusCell isInvalid={row.aaa} />
              <td
                className={cn(styles.sampleCell, row.sampleClass)}
                style={{
                  color: compareColor,
                  backgroundColor: baseColor,
                }}
              >
                {row.label}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
