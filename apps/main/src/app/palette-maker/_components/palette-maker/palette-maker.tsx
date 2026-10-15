'use client';

import { Card, Heading } from '@k8ordo/ui';
import { useMemo } from 'react';
import type { FC } from 'react';

import { generatePalette } from '../../_utils/palette';
import { ContrastTable } from '../contrast-table';
import { ExportPanel } from '../export-panel';
import { PaletteControls } from '../palette-controls';
import { PalettePreview } from '../palette-preview';
import { usePaletteState } from './use-palette-state';

import styles from './palette-maker.module.css';

export const PaletteMaker: FC = () => {
  const { hue, chroma, name, setHue, setChroma, setName, setBaseColor } =
    usePaletteState();
  const swatches = useMemo(() => generatePalette(hue, chroma), [hue, chroma]);

  return (
    <div className={styles.root}>
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
