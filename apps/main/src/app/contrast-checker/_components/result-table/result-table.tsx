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

type StatusCellProps = {
  isInvalid: boolean;
};

const StatusCell: FC<StatusCellProps> = ({ isInvalid }) => (
  <td className="px-2 py-2 sm:py-3">
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

const StatusBadge: FC<StatusCellProps & { label: string }> = ({
  isInvalid,
  label,
}) => (
  <div className="flex items-center justify-between gap-3 rounded-md bg-bg-mute px-3 py-2">
    <span className="text-sm">{label}</span>
    {isInvalid ? (
      <div className="flex items-center gap-1 text-fg-error">
        <AlertIcon size="sm" status="error" />
        <span className="font-bold text-sm">NG</span>
      </div>
    ) : (
      <div className="flex items-center gap-1 text-fg-success">
        <AlertIcon size="sm" status="success" />
        <span className="font-bold text-sm">OK</span>
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
      className: 'font-bold text-[18.66px]',
      label: '大文字の太字のテキスト（18.66px bold）',
    },
    {
      aa: isInvalidAaLargeText,
      aaa: isInvalidAaaLargeText,
      className: 'text-[24px]',
      label: '大文字のテキスト（24px）',
    },
    {
      aa: isInvalidAaNormalText,
      aaa: isInvalidAaaNormalText,
      className: 'font-bold text-[16px]',
      label: '小文字の太字のテキスト（16px bold）',
    },
    {
      aa: isInvalidAaNormalText,
      aaa: isInvalidAaaNormalText,
      className: 'text-[18.66px]',
      label: '小文字のテキスト（18.66px）',
    },
  ] as const;

  return (
    <div className="rounded-lg border border-border-base">
      <div className="flex flex-col gap-4 p-4 sm:hidden">
        {rows.map((row) => (
          <div
            className="flex flex-col gap-3 rounded-lg border border-border-base bg-bg-base p-4"
            key={row.label}
          >
            <p
              className={row.className}
              style={{
                color: compareColor,
                backgroundColor: baseColor,
              }}
            >
              {row.label}
            </p>
            <div className="flex flex-col gap-2">
              <StatusBadge isInvalid={row.aa} label="AA" />
              <StatusBadge isInvalid={row.aaa} label="AAA" />
            </div>
          </div>
        ))}
      </div>
      <table className="hidden w-full sm:table">
        <thead>
          <tr className="border-border-base border-b bg-bg-mute font-medium text-xs sm:text-sm md:text-md">
            <th className="px-3 py-2 sm:px-4 sm:py-3">AA</th>
            <th className="px-3 py-2 sm:px-4 sm:py-3">AAA</th>
            <th className="px-3 py-2 text-left sm:px-4 sm:py-3">テキスト</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              className="h-14 border-border-base border-b sm:h-16"
              key={row.label}
            >
              <StatusCell isInvalid={row.aa} />
              <StatusCell isInvalid={row.aaa} />
              <td
                className={`px-3 sm:px-4 ${row.className}`}
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
