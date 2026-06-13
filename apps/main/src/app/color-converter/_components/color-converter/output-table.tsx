'use client';

import {
  Card,
  CopyIcon,
  IconButton,
  useClipboard,
  useToast,
} from '@k8o/arte-odyssey';
import { formatAll } from '@repo/helpers/color/format';
import type { Color } from '@repo/helpers/color/spaces';
import type { FC } from 'react';

export const OutputTable: FC<{ color: Color }> = ({ color }) => {
  const rows = formatAll(color);
  const { writeClipboard } = useClipboard();
  const { onOpen } = useToast();

  const handleCopy = (value: string, label: string) => {
    void writeClipboard(value).then(() => {
      onOpen('success', `${label}をコピーしました`);
      return undefined;
    });
  };

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
                <IconButton
                  color="base"
                  label={`${row.label}をコピー`}
                  onClick={() => {
                    handleCopy(row.value, row.label);
                  }}
                >
                  <CopyIcon />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};
