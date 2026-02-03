import { AlertIcon } from '@k8o/arte-odyssey/icons';
import type { FC } from 'react';

type Props = {
  isInvalidAaLargeText: boolean;
  isInvalidAaaLargeText: boolean;
  isInvalidAaNormalText: boolean;
  isInvalidAaaNormalText: boolean;
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
  isInvalidAaLargeText,
  isInvalidAaaLargeText,
  isInvalidAaNormalText,
  isInvalidAaaNormalText,
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
          {/* 大文字: 18pt（24px）以上、太字の場合は14pt（18.66px）以上 */}
          <tr className="h-16 border-border-base border-b">
            <StatusCell isInvalid={isInvalidAaLargeText} />
            <StatusCell isInvalid={isInvalidAaaLargeText} />
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
            <StatusCell isInvalid={isInvalidAaLargeText} />
            <StatusCell isInvalid={isInvalidAaaLargeText} />
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
          {/* 小文字: 上記未満の通常テキスト */}
          <tr className="h-16 border-border-base border-b">
            <StatusCell isInvalid={isInvalidAaNormalText} />
            <StatusCell isInvalid={isInvalidAaaNormalText} />
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
            <StatusCell isInvalid={isInvalidAaNormalText} />
            <StatusCell isInvalid={isInvalidAaaNormalText} />
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
