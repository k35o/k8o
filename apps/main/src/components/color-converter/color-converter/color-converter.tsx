'use client';

import { Card } from '@k8ordo/ui';
import { parseColor } from '@repo/helpers/color/parse';
import type { Color } from '@repo/helpers/color/spaces';
import { useState } from 'react';

import { ChannelSliders } from './channel-sliders';
import { ColorTip } from './color-tip';
import { OutputTable } from './output-table';
import { SmartInput } from './smart-input';

import styles from './color-converter.module.css';

const INITIAL_COLOR: Color = parseColor('#5eead4') ?? {
  r: 0,
  g: 0,
  b: 0,
  alpha: 1,
};

export const ColorConverter = () => {
  const [color, setColor] = useState<Color>(INITIAL_COLOR);

  return (
    <div className={styles.root}>
      <ColorTip color={color} />
      <Card>
        <div className={styles.cardBody}>
          <SmartInput color={color} onColorChange={setColor} />
        </div>
      </Card>
      <Card>
        <div className={styles.cardBody}>
          <ChannelSliders color={color} onColorChange={setColor} />
        </div>
      </Card>
      <OutputTable color={color} />
    </div>
  );
};
