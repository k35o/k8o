'use client';

import { Card, Heading } from '@k8ordo/ui';
import { useMemo } from 'react';
import type { FC } from 'react';

import { BrowserOnly } from '@/components/site/browser-only/browser-only';

import { ContrastTable } from '../contrast-table/contrast-table';
import { ExportPanel } from '../export-panel/export-panel';
import { PaletteControls } from '../palette-controls/palette-controls';
import { PalettePreview } from '../palette-preview/palette-preview';
import { generatePalette } from '../palette/palette';
import { usePaletteState } from './use-palette-state';

import styles from './palette-maker.module.css';

const Content: FC = () => {
  const {
    hue,
    chroma,
    name,
    setHue,
    setChroma,
    setName,
    setBaseColor,
    commitProps,
  } = usePaletteState();
  const swatches = useMemo(() => generatePalette(hue, chroma), [hue, chroma]);

  return (
    <div className={styles.root} {...commitProps}>
      <Card>
        <div className={styles.panel}>
          <PalettePreview swatches={swatches} />
          <PaletteControls
            chroma={chroma}
            hue={hue}
            name={name}
            onBaseColorChange={setBaseColor}
            onChromaChange={setChroma}
            onHueChange={setHue}
            onNameChange={setName}
          />
          <ExportPanel name={name} swatches={swatches} />
        </div>
      </Card>
      <section className={styles.contrast}>
        <Heading level="h3">コントラスト詳細</Heading>
        <ContrastTable swatches={swatches} />
      </section>
    </div>
  );
};

// static mode の HTML は URL の state を既定値で描くので、HTML に描くと URL の値で開いたときに既定の色が
// 一度出る。Next と同じく本文はブラウザでだけ描く
export const PaletteMaker: FC = () => (
  <BrowserOnly>
    <Content />
  </BrowserOnly>
);
