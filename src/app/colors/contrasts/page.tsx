'use client';

import { FC, useState } from 'react';
import { ColorPallet } from '../_components/color-pallet/color-pallet';
import { calcContrast } from './_utils/calc_contrast';

export default function Page() {
  const [baseColor, setBaseColor] = useState('#000000');
  const [compareColor, setCompareColor] = useState('#ffffff');
  const contrast = calcContrast(baseColor, compareColor);
  const isInvalidAAContrstLarge = contrast < 4.5;
  const isInvalidAAContrstSmall = contrast < 3;
  const isInvalidAAAContrstLarge = contrast < 7;
  const isInvalidAAAContrstSmall = contrast < 4.5;

  return (
    <section className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <ColorPallet
          label="背景色"
          color={baseColor}
          setColor={setBaseColor}
        />
        <ColorPallet
          label="文字色"
          color={compareColor}
          setColor={setCompareColor}
        />
      </div>
      <p>入力した色のコントラスト比は{contrast.toFixed(2)}:1です。</p>
      <div className="rounded-md bg-white p-4">
        <Table
          isInvalidAAContrstLarge={isInvalidAAContrstLarge}
          isInvalidAAAContrstLarge={isInvalidAAAContrstLarge}
          isInvalidAAContrstSmall={isInvalidAAContrstSmall}
          isInvalidAAAContrstSmall={isInvalidAAAContrstSmall}
          compareColor={compareColor}
          baseColor={baseColor}
        />
      </div>
      <div className="w-full rounded-md border-2 border-gray-700 p-4">
        <p>
          WCAG
          2.1によると、AA基準における大文字のテキストの最小コントラスト比は4.5:1、小文字のテキストの最小コントラスト比は3:1です。
        </p>
        <p>
          AAA基準においては、大文字のテキストの最小コントラスト比は7:1、小文字のテキストの最小コントラスト比は4.5:1です。
        </p>
        <p className="mt-2">
          大文字のテキストは、18pt（24px）以上、または太字の場合は14pt（18.66px）以上である場合に適用されます。小文字のテキストは、14pt（18.66px）以上、または太字の場合は12pt（16px）以上である場合に適用されます。
        </p>
      </div>
    </section>
  );
}

type TableProps = {
  isInvalidAAContrstLarge: boolean;
  isInvalidAAAContrstLarge: boolean;
  isInvalidAAContrstSmall: boolean;
  isInvalidAAAContrstSmall: boolean;
  compareColor: string;
  baseColor: string;
};

const Table: FC<TableProps> = ({
  isInvalidAAContrstLarge,
  isInvalidAAAContrstLarge,
  isInvalidAAContrstSmall,
  isInvalidAAAContrstSmall,
  compareColor,
  baseColor,
}) => {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>AA基準</th>
          <th>AAA基準</th>
          <th>テキスト</th>
        </tr>
      </thead>
      <tbody>
        <tr className="h-16">
          <td className="text-2xl">
            {isInvalidAAContrstLarge ? (
              <p className="text-center font-bold text-red-600">NG</p>
            ) : (
              <p className="text-center font-bold text-green-600">
                OK
              </p>
            )}
          </td>
          <td className="text-2xl">
            {isInvalidAAAContrstLarge ? (
              <p className="text-center font-bold text-red-600">NG</p>
            ) : (
              <p className="text-center font-bold text-green-600">
                OK
              </p>
            )}
          </td>
          <td
            className="rounded-t-md px-4  text-[18.66px] font-bold"
            style={{
              color: compareColor,
              backgroundColor: baseColor,
            }}
          >
            大文字の太字のテキスト（18.66px bold）
          </td>
        </tr>
        <tr className="h-16">
          <td className="text-2xl">
            {isInvalidAAContrstLarge ? (
              <p className="text-center font-bold text-red-600">NG</p>
            ) : (
              <p className="text-center font-bold text-green-600">
                OK
              </p>
            )}
          </td>
          <td className="text-2xl">
            {isInvalidAAAContrstLarge ? (
              <p className="text-center font-bold text-red-600">NG</p>
            ) : (
              <p className="text-center font-bold text-green-600">
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
        <tr className="h-16">
          <td className="text-2xl">
            {isInvalidAAContrstSmall ? (
              <p className="text-center font-bold text-red-600">NG</p>
            ) : (
              <p className="text-center font-bold text-green-600">
                OK
              </p>
            )}
          </td>
          <td className="text-2xl">
            {isInvalidAAAContrstSmall ? (
              <p className="text-center font-bold text-red-600">NG</p>
            ) : (
              <p className="text-center font-bold text-green-600">
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
        <tr className="h-16">
          <td className="text-2xl">
            {isInvalidAAContrstSmall ? (
              <p className="text-center font-bold text-red-600">NG</p>
            ) : (
              <p className="text-center font-bold text-green-600">
                OK
              </p>
            )}
          </td>
          <td className="text-2xl">
            {isInvalidAAAContrstLarge ? (
              <p className="text-center font-bold text-red-600">NG</p>
            ) : (
              <p className="text-center font-bold text-green-600">
                OK
              </p>
            )}
          </td>
          <td
            className="rounded-b-md px-4 text-[18.66px] font-bold"
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
