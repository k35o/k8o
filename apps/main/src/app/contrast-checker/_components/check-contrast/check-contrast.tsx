'use client';

import { calcContrast } from '@repo/helpers/color/calc-contrast';
import { type FC, useState } from 'react';
import { ColorPallet } from '../color-pallet';
import { ResultTable } from '../result-table';

export const CheckContrast: FC = () => {
  const [baseColor, setBaseColor] = useState('#000000');
  const [compareColor, setCompareColor] = useState('#ffffff');
  const contrast = calcContrast(baseColor, compareColor);
  const isInvalidAaContrstLarge = contrast < 4.5;
  const isInvalidAaContrstSmall = contrast < 3;
  const isInvalidAaaContrstLarge = contrast < 7;
  const isInvalidAaaContrstSmall = contrast < 4.5;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <ColorPallet color={baseColor} label="背景色" setColor={setBaseColor} />
        <ColorPallet
          color={compareColor}
          label="文字色"
          setColor={setCompareColor}
        />
      </div>
      <div className="flex flex-col gap-4">
        <p className="font-bold text-xl">
          入力した色のコントラスト比は{contrast.toFixed(2)}:1です
        </p>
        <ResultTable
          baseColor={baseColor}
          compareColor={compareColor}
          isInvalidAAAContrstLarge={isInvalidAaaContrstLarge}
          isInvalidAAAContrstSmall={isInvalidAaaContrstSmall}
          isInvalidAAContrstLarge={isInvalidAaContrstLarge}
          isInvalidAAContrstSmall={isInvalidAaContrstSmall}
        />
      </div>
    </div>
  );
};
