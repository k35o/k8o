import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { generatePalette } from '../../_utils/palette';
import { PalettePreview } from './palette-preview';

const meta: Meta<typeof PalettePreview> = {
  title: 'app/palette-maker/palette-preview',
  component: PalettePreview,
};

export default meta;
type Story = StoryObj<typeof PalettePreview>;

export const Primary: Story = {
  args: {
    swatches: generatePalette(250, 0.12),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('50')).toBeInTheDocument();
    await expect(canvas.getByText('950')).toBeInTheDocument();
    await expect(
      canvas.queryByText('＊はsRGB色域に収めるため彩度を自動調整した段です'),
    ).not.toBeInTheDocument();
  },
};

export const WithClamped: Story = {
  args: {
    swatches: generatePalette(145, 0.4),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('＊はsRGB色域に収めるため彩度を自動調整した段です'),
    ).toBeInTheDocument();
  },
};

export const Neutral: Story = {
  args: {
    swatches: generatePalette(250, 0),
  },
};
