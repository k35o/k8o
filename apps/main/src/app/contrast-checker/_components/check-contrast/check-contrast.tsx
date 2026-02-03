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
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4">
        <ColorPallet color={baseColor} label="背景色" setColor={setBaseColor} />
        <ColorPallet
          color={compareColor}
          label="文字色"
          setColor={setCompareColor}
        />
      </div>
      {/* プレビュー */}
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border-base p-8"
        style={{ backgroundColor: baseColor }}
      >
        <p
          className="font-bold text-2xl md:text-3xl"
          style={{ color: compareColor }}
        >
          テキストのプレビュー
        </p>
        <p className="text-sm md:text-base" style={{ color: compareColor }}>
          この文字と背景色の組み合わせを確認できます
        </p>
      </div>
      {/* コントラスト比 */}
      <div className="flex flex-col items-center gap-2 rounded-lg bg-bg-mute p-6">
        <p className="font-bold text-xl">
          入力した色のコントラスト比は{contrast.toFixed(2)}:1です
        </p>
      </div>
      <ResultTable
        baseColor={baseColor}
        compareColor={compareColor}
        isInvalidAAAContrstLarge={isInvalidAaaContrstLarge}
        isInvalidAAAContrstSmall={isInvalidAaaContrstSmall}
        isInvalidAAContrstLarge={isInvalidAaContrstLarge}
        isInvalidAAContrstSmall={isInvalidAaContrstSmall}
      />
    </div>
  );
};
