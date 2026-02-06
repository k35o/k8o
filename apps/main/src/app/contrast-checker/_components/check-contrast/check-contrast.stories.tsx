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

    // 初期状態（黒と白）のコントラスト比は21:1
    await expect(
      canvas.getByText('コントラスト比 21.00:1'),
    ).toBeInTheDocument();
  },
};

export const ColorInputs: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 背景色と文字色のラベルが存在することを確認
    await expect(canvas.getByText('背景色')).toBeInTheDocument();
    await expect(canvas.getByText('文字色')).toBeInTheDocument();

    // カラーピッカーが存在することを確認
    const colorInputs = canvasElement.querySelectorAll('input[type="color"]');
    await expect(colorInputs.length).toBe(2);
  },
};
