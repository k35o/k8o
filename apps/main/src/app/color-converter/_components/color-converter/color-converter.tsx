'use client';

import { Card } from '@k8o/arte-odyssey';
import { parseColor } from '@repo/helpers/color/parse';
import type { Color } from '@repo/helpers/color/spaces';
import { useState } from 'react';

import { ChannelSliders } from './channel-sliders';
import { ColorTip } from './color-tip';
import { OutputTable } from './output-table';
import { SmartInput } from './smart-input';

const INITIAL_COLOR: Color = parseColor('#5eead4') ?? {
  r: 0,
  g: 0,
  b: 0,
  alpha: 1,
};

export const ColorConverter = () => {
  const [color, setColor] = useState<Color>(INITIAL_COLOR);

  return (
    <div className="flex flex-col gap-6">
      <ColorTip color={color} />
      <Card>
        <div className="p-5">
          <SmartInput color={color} onColorChange={setColor} />
        </div>
      </Card>
      <Card>
        <div className="p-5">
          <ChannelSliders color={color} onColorChange={setColor} />
        </div>
      </Card>
      <OutputTable color={color} />
    </div>
  );
};
