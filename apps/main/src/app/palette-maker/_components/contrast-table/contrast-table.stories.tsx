import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { PALETTE_STEPS } from '../../_types/palette';
import { generatePalette } from '../../_utils/palette';
import { ContrastTable } from './contrast-table';

const meta = preview.meta({
  title: 'app/palette-maker/contrast-table',
  component: ContrastTable,
});

export const Primary = meta.story({
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
});
