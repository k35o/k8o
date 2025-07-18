import { FC } from 'react';

type Props = {
  isInvalidAAContrstLarge: boolean;
  isInvalidAAAContrstLarge: boolean;
  isInvalidAAContrstSmall: boolean;
  isInvalidAAAContrstSmall: boolean;
  compareColor: string;
  baseColor: string;
};

export const ResultTable: FC<Props> = ({
  isInvalidAAContrstLarge,
  isInvalidAAAContrstLarge,
  isInvalidAAContrstSmall,
  isInvalidAAAContrstSmall,
  compareColor,
  baseColor,
}) => {
  return (
    <table className="w-full wrap-normal">
      <thead>
        <tr className="border-border-base md:texxt-md border-b text-sm font-medium">
          <th>AA</th>
          <th>AAA</th>
          <th>テキスト</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-border-base h-16 border-b">
          <td className="px-2 text-lg md:text-2xl">
            {isInvalidAAContrstLarge ? (
              <p className="text-fg-error text-center font-bold">
                NG
              </p>
            ) : (
              <p className="text-fg-success text-center font-bold">
                OK
              </p>
            )}
          </td>
          <td className="px-2 text-lg md:text-2xl">
            {isInvalidAAAContrstLarge ? (
              <p className="text-fg-error text-center font-bold">
                NG
              </p>
            ) : (
              <p className="text-fg-success text-center font-bold">
                OK
              </p>
            )}
          </td>
          <td
            className="px-4 text-[18.66px] font-bold"
            style={{
              color: compareColor,
              backgroundColor: baseColor,
            }}
          >
            大文字の太字のテキスト（18.66px bold）
          </td>
        </tr>
        <tr className="border-border-base h-16 border-b">
          <td className="px-2 text-lg md:text-2xl">
            {isInvalidAAContrstLarge ? (
              <p className="text-fg-error text-center font-bold">
                NG
              </p>
            ) : (
              <p className="text-fg-success text-center font-bold">
                OK
              </p>
            )}
          </td>
          <td className="px-2 text-lg md:text-2xl">
            {isInvalidAAAContrstLarge ? (
              <p className="text-fg-error text-center font-bold">
                NG
              </p>
            ) : (
              <p className="text-fg-success text-center font-bold">
                OK
              </p>
            )}
          </td>
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
        <tr className="border-border-base h-16 border-b">
          <td className="px-2 text-lg md:text-2xl">
            {isInvalidAAContrstSmall ? (
              <p className="text-fg-error text-center font-bold">
                NG
              </p>
            ) : (
              <p className="text-fg-success text-center font-bold">
                OK
              </p>
            )}
          </td>
          <td className="px-2 text-lg md:text-2xl">
            {isInvalidAAAContrstSmall ? (
              <p className="text-fg-error text-center font-bold">
                NG
              </p>
            ) : (
              <p className="text-fg-success text-center font-bold">
                OK
              </p>
            )}
          </td>
          <td
            className="px-4 text-[16px] font-bold"
            style={{
              color: compareColor,
              backgroundColor: baseColor,
            }}
          >
            小文字の太字のテキスト（16px bold）
          </td>
        </tr>
        <tr className="border-border-base h-16 border-b">
          <td className="px-2 text-lg md:text-2xl">
            {isInvalidAAContrstSmall ? (
              <p className="text-fg-error text-center font-bold">
                NG
              </p>
            ) : (
              <p className="text-fg-success text-center font-bold">
                OK
              </p>
            )}
          </td>
          <td className="px-2 text-lg md:text-2xl">
            {isInvalidAAAContrstLarge ? (
              <p className="text-fg-error text-center font-bold">
                NG
              </p>
            ) : (
              <p className="text-fg-success text-center font-bold">
                OK
              </p>
            )}
          </td>
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
  );
};
