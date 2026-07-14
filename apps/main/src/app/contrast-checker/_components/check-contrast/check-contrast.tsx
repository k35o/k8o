'use client';

import { Alert, Heading } from '@k8o/arte-odyssey';
import { calcApca } from '@repo/helpers/color/calc-apca';
import { calcContrast } from '@repo/helpers/color/calc-contrast';
import { useEffect, useState } from 'react';
import type { FC } from 'react';

import { ApcaResultTable } from '../apca-result-table';
import { ColorPallet } from '../color-pallet';
import { ResultTable } from '../result-table';

export const CheckContrast: FC = () => {
  const [baseColor, setBaseColor] = useState('#000000');
  const [compareColor, setCompareColor] = useState('#ffffff');
  const contrast = calcContrast(baseColor, compareColor);
  const apcaLc = calcApca(compareColor, baseColor);

  const WCAG_THRESHOLDS = {
    AA_LARGE_TEXT: 3,
    AAA_LARGE_TEXT: 4.5,
    AA_NORMAL_TEXT: 4.5,
    AAA_NORMAL_TEXT: 7,
    LOW_VISIBILITY_WARNING: 2,
  } as const;

  const isInvalidAaLargeText = contrast < WCAG_THRESHOLDS.AA_LARGE_TEXT;
  const isInvalidAaaLargeText = contrast < WCAG_THRESHOLDS.AAA_LARGE_TEXT;
  const isInvalidAaNormalText = contrast < WCAG_THRESHOLDS.AA_NORMAL_TEXT;
  const isInvalidAaaNormalText = contrast < WCAG_THRESHOLDS.AAA_NORMAL_TEXT;

  // カラーピッカーのドラッグ中は change が連続発火するため、読み上げは
  // デバウンスして最新の結果だけをスクリーンリーダーに通知する
  const [announcement, setAnnouncement] = useState('');
  useEffect(() => {
    const id = setTimeout(() => {
      setAnnouncement(
        `コントラスト比 ${contrast.toFixed(2)}対1、APCA Lc ${apcaLc.toFixed(1)}`,
      );
    }, 500);
    return () => {
      clearTimeout(id);
    };
  }, [contrast, apcaLc]);

  return (
    <div className="flex flex-col gap-8">
      <output className="sr-only">{announcement}</output>
      <div className="grid grid-cols-2 gap-4">
        <ColorPallet color={baseColor} label="背景色" setColor={setBaseColor} />
        <ColorPallet
          color={compareColor}
          label="文字色"
          setColor={setCompareColor}
        />
      </div>
      <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-6">
        <p className="text-center text-sm font-medium sm:text-base">
          コントラスト比 {contrast.toFixed(2)}:1
        </p>
        <p className="text-center text-sm font-medium sm:text-base">
          APCA Lc {apcaLc.toFixed(1)}
        </p>
      </div>
      {contrast < WCAG_THRESHOLDS.LOW_VISIBILITY_WARNING && (
        <Alert
          message="コントラスト比が非常に低いため、テキストが見えにくい場合があります"
          tone="warning"
        />
      )}
      <section
        aria-label="選択した色の組み合わせのプレビュー"
        className="flex flex-col items-center justify-center gap-3 rounded-xl p-6 md:p-8"
        style={{ backgroundColor: baseColor }}
      >
        <p
          className="text-xl font-bold md:text-3xl"
          style={{ color: compareColor }}
        >
          テキストのプレビュー
        </p>
        <p className="text-xs md:text-base" style={{ color: compareColor }}>
          この文字と背景色の組み合わせを確認できます
        </p>
      </section>
      <section className="flex flex-col gap-3">
        <Heading type="h3">WCAG 2.2による判定</Heading>
        <ResultTable
          baseColor={baseColor}
          compareColor={compareColor}
          isInvalidAaaLargeText={isInvalidAaaLargeText}
          isInvalidAaaNormalText={isInvalidAaaNormalText}
          isInvalidAaLargeText={isInvalidAaLargeText}
          isInvalidAaNormalText={isInvalidAaNormalText}
        />
      </section>
      <section className="flex flex-col gap-3">
        <Heading type="h3">APCAによる判定</Heading>
        <ApcaResultTable lc={apcaLc} />
      </section>
    </div>
  );
};
