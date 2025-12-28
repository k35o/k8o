import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { ToggleTheme } from './toggle-theme';

const meta: Meta<typeof ToggleTheme> = {
  title: 'app/globals/toggle-theme',
  component: ToggleTheme,
};

export default meta;
type Story = StoryObj<typeof ToggleTheme>;

export const Primary: Story = {};

export const ClickToggle: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // トグルボタンをクリック
    const toggleButton = canvas.getByRole('button', {
      name: 'テーマを切り替える',
    });
    await expect(toggleButton).toBeInTheDocument();
    await userEvent.click(toggleButton);

    // ボタンが引き続き存在することを確認
    await expect(toggleButton).toBeInTheDocument();
  },
};
