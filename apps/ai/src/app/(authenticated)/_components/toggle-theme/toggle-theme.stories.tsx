import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { ToggleTheme } from './toggle-theme';

const meta = {
  component: ToggleTheme,
} satisfies Meta<typeof ToggleTheme>;

export default meta;

type Story = StoryObj<typeof meta>;

// テーマ切替ボタンがアクセシブルな名前付きで描画され、クリックで例外を投げないこと。
// 実際のテーマ反映は preview の decorator(ApplyThemeByStorybook)が theme を制御するため、
// ここでは描画と操作可能性のスモークに留める。
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', {
      name: 'テーマを切り替える',
    });
    await expect(button).toBeInTheDocument();
    await userEvent.click(button);
    await expect(button).toBeInTheDocument();
  },
};
