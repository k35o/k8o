'use client';

import { FC, useState } from 'react';
import { calcContrast } from '../../_utils/calc_contrast';
import { ResultTable } from '../result-table';
import { ColorPallet } from '../color-pallet';

export const CheckContrast: FC = () => {
  const [baseColor, setBaseColor] = useState('#000000');
  const [compareColor, setCompareColor] = useState('#ffffff');
  const contrast = calcContrast(baseColor, compareColor);
  const isInvalidAAContrstLarge = contrast < 4.5;
  const isInvalidAAContrstSmall = contrast < 3;
  const isInvalidAAAContrstLarge = contrast < 7;
  const isInvalidAAAContrstSmall = contrast < 4.5;

  return (
    <div className="flex flex-col gap-6">
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
      <div className="flex flex-col gap-4">
        <p className="text-xl font-bold">
          入力した色のコントラスト比は{contrast.toFixed(2)}:1です
        </p>
        <ResultTable
          isInvalidAAContrstLarge={isInvalidAAContrstLarge}
          isInvalidAAAContrstLarge={isInvalidAAAContrstLarge}
          isInvalidAAContrstSmall={isInvalidAAContrstSmall}
          isInvalidAAAContrstSmall={isInvalidAAAContrstSmall}
          compareColor={compareColor}
          baseColor={baseColor}
        />
      </div>
    </div>
  );
};
