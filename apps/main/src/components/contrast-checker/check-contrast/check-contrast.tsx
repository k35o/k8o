'use client';

import { Alert, Heading, Stack } from '@k8ordo/ui';
import { calcApca } from '@repo/helpers/color/calc-apca';
import { calcContrast } from '@repo/helpers/color/calc-contrast';
import { useState } from 'react';
import type { FC } from 'react';

import { DebouncedAnnouncement } from '@/components/site/debounced-announcement/debounced-announcement';

import { ApcaResultTable } from '../apca-result-table/apca-result-table';
import { ColorPallet } from '../color-pallet/color-pallet';
import { ResultTable } from '../result-table/result-table';

import styles from './check-contrast.module.css';

const WCAG_THRESHOLDS = {
  AA_LARGE_TEXT: 3,
  AAA_LARGE_TEXT: 4.5,
  AA_NORMAL_TEXT: 4.5,
  AAA_NORMAL_TEXT: 7,
  LOW_VISIBILITY_WARNING: 2,
} as const;

export const CheckContrast: FC = () => {
  const [baseColor, setBaseColor] = useState('#000000');
  const [compareColor, setCompareColor] = useState('#ffffff');
  const contrast = calcContrast(baseColor, compareColor);
  const apcaLc = calcApca(compareColor, baseColor);

  const isInvalidAaLargeText = contrast < WCAG_THRESHOLDS.AA_LARGE_TEXT;
  const isInvalidAaaLargeText = contrast < WCAG_THRESHOLDS.AAA_LARGE_TEXT;
  const isInvalidAaNormalText = contrast < WCAG_THRESHOLDS.AA_NORMAL_TEXT;
  const isInvalidAaaNormalText = contrast < WCAG_THRESHOLDS.AAA_NORMAL_TEXT;

  return (
    <Stack gap="xl">
      {/* カラーピッカーのドラッグ中は change が連続発火するので、最新の結果だけを通知する */}
      <DebouncedAnnouncement
        message={`コントラスト比 ${contrast.toFixed(2)}対1、APCA Lc ${apcaLc.toFixed(1)}`}
      />
      <div className={styles.palettes}>
        <ColorPallet color={baseColor} label="背景色" setColor={setBaseColor} />
        <ColorPallet
          color={compareColor}
          label="文字色"
          setColor={setCompareColor}
        />
      </div>
      <div className={styles.scores}>
        <p className={styles.score}>コントラスト比 {contrast.toFixed(2)}:1</p>
        <p className={styles.score}>APCA Lc {apcaLc.toFixed(1)}</p>
      </div>
      {contrast < WCAG_THRESHOLDS.LOW_VISIBILITY_WARNING && (
        <Alert
          message="コントラスト比が非常に低いため、テキストが見えにくい場合があります"
          tone="warning"
        />
      )}
      <section
        aria-label="選択した色の組み合わせのプレビュー"
        className={styles.preview}
        style={{ backgroundColor: baseColor }}
      >
        <p className={styles.previewTitle} style={{ color: compareColor }}>
          テキストのプレビュー
        </p>
        <p className={styles.previewText} style={{ color: compareColor }}>
          この文字と背景色の組み合わせを確認できます
        </p>
      </section>
      <section className={styles.section}>
        <Heading level="h3">WCAG 2.2による判定</Heading>
        <ResultTable
          baseColor={baseColor}
          compareColor={compareColor}
          isInvalidAaaLargeText={isInvalidAaaLargeText}
          isInvalidAaaNormalText={isInvalidAaaNormalText}
          isInvalidAaLargeText={isInvalidAaLargeText}
          isInvalidAaNormalText={isInvalidAaNormalText}
        />
      </section>
      <section className={styles.section}>
        <Heading level="h3">APCAによる判定</Heading>
        <ApcaResultTable lc={apcaLc} />
      </section>
    </Stack>
  );
};
