import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { generatePalette } from '../../_utils/palette';
import { PalettePreview } from './palette-preview';

const meta = preview.meta({
  title: 'app/palette-maker/palette-preview',
  component: PalettePreview,
});

export const Primary = meta.story({
  args: {
    swatches: generatePalette(250, 0.12),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('50')).toBeInTheDocument();
    await expect(canvas.getByText('950')).toBeInTheDocument();
    await expect(
      canvas.getByText('＊はsRGB色域に収めるため彩度を自動調整した段です'),
    ).not.toBeVisible();
  },
});

export const WithClamped = meta.story({
  args: {
    swatches: generatePalette(145, 0.4),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('＊はsRGB色域に収めるため彩度を自動調整した段です'),
    ).toBeVisible();
  },
});

export const Neutral = meta.story({
  args: {
    swatches: generatePalette(250, 0),
  },
});
