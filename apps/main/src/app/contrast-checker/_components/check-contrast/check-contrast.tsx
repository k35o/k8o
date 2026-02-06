'use client';

import { Alert } from '@k8o/arte-odyssey/alert';
import { calcContrast } from '@repo/helpers/color/calc-contrast';
import { type FC, useState } from 'react';
import { ColorPallet } from '../color-pallet';
import { ResultTable } from '../result-table';

export const CheckContrast: FC = () => {
  const [baseColor, setBaseColor] = useState('#000000');
  const [compareColor, setCompareColor] = useState('#ffffff');
  const contrast = calcContrast(baseColor, compareColor);

  const WCAG_THRESHOLDS = {
    AA_LARGE_TEXT: 3,
    AAA_LARGE_TEXT: 4.5,
    AA_NORMAL_TEXT: 4.5,
    AAA_NORMAL_TEXT: 7,
    LOW_VISIBILITY_WARNING: 2,
  } as const;

  // 大文字（≥18pt or ≥14pt bold）の基準
  const isInvalidAaLargeText = contrast < WCAG_THRESHOLDS.AA_LARGE_TEXT; // AA: 3:1以上
  const isInvalidAaaLargeText = contrast < WCAG_THRESHOLDS.AAA_LARGE_TEXT; // AAA: 4.5:1以上
  // 小文字（通常テキスト）の基準
  const isInvalidAaNormalText = contrast < WCAG_THRESHOLDS.AA_NORMAL_TEXT; // AA: 4.5:1以上
  const isInvalidAaaNormalText = contrast < WCAG_THRESHOLDS.AAA_NORMAL_TEXT; // AAA: 7:1以上

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
      <p className="text-center font-medium text-sm sm:text-base">
        コントラスト比 {contrast.toFixed(2)}:1
      </p>
      {contrast < WCAG_THRESHOLDS.LOW_VISIBILITY_WARNING && (
        <Alert
          message="コントラスト比が非常に低いため、テキストが見えにくい場合があります"
          status="warning"
        />
      )}
      <section
        aria-label="選択した色の組み合わせのプレビュー"
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
      </section>
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
