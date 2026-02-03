import { AlertIcon } from '@k8o/arte-odyssey/icons';
import type { FC } from 'react';

type Props = {
  isInvalidAAContrstLarge: boolean;
  isInvalidAAAContrstLarge: boolean;
  isInvalidAAContrstSmall: boolean;
  isInvalidAAAContrstSmall: boolean;
  compareColor: string;
  baseColor: string;
};

const StatusCell: FC<{ isInvalid: boolean }> = ({ isInvalid }) => (
  <td className="px-2">
    {isInvalid ? (
      <div className="flex items-center justify-center gap-1 text-fg-error">
        <AlertIcon size="sm" status="error" />
        <span className="font-bold">NG</span>
      </div>
    ) : (
      <div className="flex items-center justify-center gap-1 text-fg-success">
        <AlertIcon size="sm" status="success" />
        <span className="font-bold">OK</span>
      </div>
    )}
  </td>
);

export const ResultTable: FC<Props> = ({
  isInvalidAAContrstLarge,
  isInvalidAAAContrstLarge,
  isInvalidAAContrstSmall,
  isInvalidAAAContrstSmall,
  compareColor,
  baseColor,
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-border-base">
      <table className="w-full">
        <thead>
          <tr className="border-border-base border-b bg-bg-mute font-medium text-sm md:text-md">
            <th className="px-4 py-3">AA</th>
            <th className="px-4 py-3">AAA</th>
            <th className="px-4 py-3 text-left">テキスト</th>
          </tr>
        </thead>
        <tbody>
          <tr className="h-16 border-border-base border-b">
            <StatusCell isInvalid={isInvalidAAContrstLarge} />
            <StatusCell isInvalid={isInvalidAAAContrstLarge} />
            <td
              className="px-4 font-bold text-[18.66px]"
              style={{
                color: compareColor,
                backgroundColor: baseColor,
              }}
            >
              大文字の太字のテキスト（18.66px bold）
            </td>
          </tr>
          <tr className="h-16 border-border-base border-b">
            <StatusCell isInvalid={isInvalidAAContrstLarge} />
            <StatusCell isInvalid={isInvalidAAAContrstLarge} />
            <td
              className="px-4 text-[24px]"
              style={{
                color: compareColor,
                backgroundColor: baseColor,
              }}
            >
              大文字のテキスト（24px）
            </td>
          </tr>
          <tr className="h-16 border-border-base border-b">
            <StatusCell isInvalid={isInvalidAAContrstSmall} />
            <StatusCell isInvalid={isInvalidAAAContrstSmall} />
            <td
              className="px-4 font-bold text-[16px]"
              style={{
                color: compareColor,
                backgroundColor: baseColor,
              }}
            >
              小文字の太字のテキスト（16px bold）
            </td>
          </tr>
          <tr className="h-16 border-border-base border-b">
            <StatusCell isInvalid={isInvalidAAContrstSmall} />
            <StatusCell isInvalid={isInvalidAAAContrstLarge} />
            <td
              className="px-4 text-[18.66px]"
              style={{
                color: compareColor,
                backgroundColor: baseColor,
              }}
            >
              小文字のテキスト（18.66px）
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
