import { Heading } from '@k8ordo/ui';
import { PaletteIcon, SparklesIcon } from '@k8ordo/ui/icons';
import type { FC } from 'react';

import { BrowserSupportStatus } from '@/components/site/browser-support-status/browser-support-status';

import { RadiusMaker } from '../radius-maker/radius-maker';

import styles from './radius-maker-index.module.css';

// PaletteIcon と SparklesIcon をどのページも読むファイルに載せないよう、サーバーで描いて渡す。対応状況も、
// RadiusMaker から静的に読むと、対応状況を描かない記事までその JS を読むので、サーバーで描いて渡す
export const RadiusMakerIndex: FC = () => (
  <div className={styles.root}>
    <div className={styles.content}>
      <Heading level="h2">かどまるラボ</Heading>
      <section className={styles.section}>
        <RadiusMaker
          cornerShapeSupport={<BrowserSupportStatus featureId="corner-shape" />}
          previewIcon={<PaletteIcon />}
          randomIcon={<SparklesIcon />}
        />
      </section>
    </div>
  </div>
);
