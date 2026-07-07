import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { generatePalette } from '../../_utils/palette';
import { ExportPanel } from './export-panel';

const meta: Meta<typeof ExportPanel> = {
  title: 'app/palette-maker/export-panel',
  component: ExportPanel,
  args: {
    name: 'primary',
    swatches: generatePalette(250, 0.12),
  },
};

export default meta;
type Story = StoryObj<typeof ExportPanel>;

export const Primary: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/:root \{/u)).toBeInTheDocument();
    await expect(
      canvas.getByText(/--color-primary-500: oklch\(0\.66 0\.12 250\);/u),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'CSS変数をコピー' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: '共有用URLをコピー' }),
    ).toBeInTheDocument();
  },
};

export const SwitchToTailwind: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Tailwind @theme' }));
    await expect(await canvas.findByText(/@theme \{/u)).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Tailwind @themeをコピー' }),
    ).toBeInTheDocument();
  },
};
