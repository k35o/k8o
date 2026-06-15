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

    const toggleButton = canvas.getByRole('button', {
      name: 'テーマを切り替える',
    });
    await expect(toggleButton).toBeInTheDocument();
    await userEvent.click(toggleButton);

    await expect(toggleButton).toBeInTheDocument();
  },
};
