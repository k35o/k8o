'use client';

import { calcContrast } from '@repo/helpers/color/calc-contrast';
import { type FC, useState } from 'react';
import { ColorPallet } from '../color-pallet';
import { ResultTable } from '../result-table';

export const CheckContrast: FC = () => {
  const [baseColor, setBaseColor] = useState('#000000');
  const [compareColor, setCompareColor] = useState('#ffffff');
  const contrast = calcContrast(baseColor, compareColor);

  // 大文字（≥18pt or ≥14pt bold）の基準
  const isInvalidAaLargeText = contrast < 3; // AA: 3:1以上
  const isInvalidAaaLargeText = contrast < 4.5; // AAA: 4.5:1以上
  // 小文字（通常テキスト）の基準
  const isInvalidAaNormalText = contrast < 4.5; // AA: 4.5:1以上
  const isInvalidAaaNormalText = contrast < 7; // AAA: 7:1以上

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
        className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border-base p-6 md:p-8"
        style={{ backgroundColor: baseColor }}
      >
        <p
          className="font-bold text-xl md:text-3xl"
          style={{ color: compareColor }}
        >
          テキストのプレビュー
        </p>
        <p className="text-xs md:text-base" style={{ color: compareColor }}>
          この文字と背景色の組み合わせを確認できます
        </p>
        {contrast < 2 && (
          <p className="mt-2 rounded-md bg-bg-base px-3 py-1 text-fg-warning text-xs md:text-sm">
            コントラスト比が非常に低いため、テキストが見えにくい場合があります
          </p>
        )}
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
        isInvalidAaaLargeText={isInvalidAaaLargeText}
        isInvalidAaaNormalText={isInvalidAaaNormalText}
        isInvalidAaLargeText={isInvalidAaLargeText}
        isInvalidAaNormalText={isInvalidAaNormalText}
      />
    </div>
  );
};
