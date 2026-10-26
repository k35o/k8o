import { expect, waitFor, within } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { ToggleTheme } from './toggle-theme';

const meta = preview.meta({
  title: 'app/globals/toggle-theme',
  component: ToggleTheme,
});

export const Primary = meta.story();

export const ClickToggle = meta.story({
  parameters: { theme: 'light' },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const toggleButton = canvas.getByRole('button', {
      name: 'テーマを切り替える',
    });
    await expect(document.documentElement).not.toHaveClass('dark');
    await userEvent.click(toggleButton);

    await waitFor(async () => {
      await expect(document.documentElement).toHaveClass('dark');
    });
  },
});

export const ClickToggleFromDark = meta.story({
  parameters: { theme: 'dark' },
  play: async ({ canvas, userEvent }) => {
    await expect(document.documentElement).toHaveClass('dark');
    await userEvent.click(
      canvas.getByRole('button', { name: 'テーマを切り替える' }),
    );

    await waitFor(async () => {
      await expect(document.documentElement).not.toHaveClass('dark');
    });
  },
});
