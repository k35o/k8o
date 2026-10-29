'use client';

import { Card, CopyButton } from '@k8ordo/ui';
import { formatAll } from '@repo/helpers/color/format';
import type { Color } from '@repo/helpers/color/spaces';
import type { FC } from 'react';

import styles from './output-table.module.css';

export const OutputTable: FC<{ color: Color }> = ({ color }) => {
  const rows = formatAll(color);

  return (
    <Card>
      <table className={styles.table}>
        <caption className={styles.srOnly}>色形式の対応表</caption>
        <tbody>
          {rows.map((row) => (
            <tr className={styles.row} key={row.key}>
              <th className={styles.label} scope="row">
                {row.label}
              </th>
              <td className={styles.value}>
                <code className={styles.code}>{row.value}</code>
              </td>
              <td className={styles.action}>
                <CopyButton
                  iconOnly
                  label={`${row.label}をコピー`}
                  value={row.value}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};
