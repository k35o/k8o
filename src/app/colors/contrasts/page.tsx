'use client';

import { useState } from 'react';
import { ColorPallet } from '../_components/color-pallet/color-pallet';
import { calcContrast } from './_utils/calc_contrast';
import { ResultTable } from './_components/result-table';

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
        <ResultTable
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
