'use client';

import { Card, CopyButton } from '@k8ordo/ui';
import { formatAll } from '@repo/helpers/color/format';
import type { Color } from '@repo/helpers/color/spaces';
import type { FC } from 'react';

export const OutputTable: FC<{ color: Color }> = ({ color }) => {
  const rows = formatAll(color);

  return (
    <Card>
      <table className="w-full text-left">
        <caption className="sr-only">色形式の対応表</caption>
        <tbody>
          {rows.map((row) => (
            <tr
              className="border-border-base border-b last:border-b-0"
              key={row.key}
            >
              <th
                className="text-fg-mute w-14 p-3 align-middle text-xs font-bold sm:w-24 sm:text-sm"
                scope="row"
              >
                {row.label}
              </th>
              <td className="px-2 py-3 align-middle">
                <code className="text-fg-base font-mono text-xs break-all select-all sm:text-sm">
                  {row.value}
                </code>
              </td>
              <td className="py-2 pr-3 pl-1 align-middle">
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
