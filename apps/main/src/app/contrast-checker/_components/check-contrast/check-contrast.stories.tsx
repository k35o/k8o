import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { CheckContrast } from './check-contrast';

const meta: Meta<typeof CheckContrast> = {
  title: 'app/contrast-checker/check-contrast',
  component: CheckContrast,
};

export default meta;
type Story = StoryObj<typeof CheckContrast>;

export const Default: Story = {};

export const InitialContrast: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('コントラスト比 21.00:1'),
    ).toBeInTheDocument();

    await expect(canvas.getByText('APCA Lc -107.9')).toBeInTheDocument();
  },
};

export const ColorInputs: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('背景色')).toBeInTheDocument();
    await expect(canvas.getByText('文字色')).toBeInTheDocument();

    const colorInputs = canvasElement.querySelectorAll('input[type="color"]');
    await expect(colorInputs.length).toBe(2);
  },
};
