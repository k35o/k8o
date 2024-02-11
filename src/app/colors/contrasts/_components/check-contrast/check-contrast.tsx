'use client';

import { FC, useState } from 'react';
import { calcContrast } from '../../_utils/calc_contrast';
import { ResultTable } from '../result-table';
import { ColorPallet } from '@/app/colors/_components/color-pallet/color-pallet';

export const CheckContrast: FC = () => {
  const [baseColor, setBaseColor] = useState('#000000');
  const [compareColor, setCompareColor] = useState('#ffffff');
  const contrast = calcContrast(baseColor, compareColor);
  const isInvalidAAContrstLarge = contrast < 4.5;
  const isInvalidAAContrstSmall = contrast < 3;
  const isInvalidAAAContrstLarge = contrast < 7;
  const isInvalidAAAContrstSmall = contrast < 4.5;

  return (
    <>
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
    </>
  );
};
