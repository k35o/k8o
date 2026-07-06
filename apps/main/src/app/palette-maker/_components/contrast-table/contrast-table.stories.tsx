import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { PALETTE_STEPS } from '../../_types/palette';
import { generatePalette } from '../../_utils/palette';
import { ContrastTable } from './contrast-table';

const meta: Meta<typeof ContrastTable> = {
  title: 'app/palette-maker/contrast-table',
  component: ContrastTable,
};

export default meta;
type Story = StoryObj<typeof ContrastTable>;

export const Primary: Story = {
  args: {
    swatches: generatePalette(250, 0.12),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole('table');
    const rows = within(table).getAllByRole('row');
    // ヘッダー行 + 11段
    await expect(rows).toHaveLength(PALETTE_STEPS.length + 1);
    await expect(
      within(table).getByText('oklch(0.66 0.12 250)'),
    ).toBeInTheDocument();
  },
};
