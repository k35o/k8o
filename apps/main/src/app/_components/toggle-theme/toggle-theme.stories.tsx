import { expect, within } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { ToggleTheme } from './toggle-theme';

const meta = preview.meta({
  title: 'app/globals/toggle-theme',
  component: ToggleTheme,
});

export const Primary = meta.story();

export const ClickToggle = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const toggleButton = canvas.getByRole('button', {
      name: 'テーマを切り替える',
    });
    await expect(toggleButton).toBeInTheDocument();
    await userEvent.click(toggleButton);

    await expect(toggleButton).toBeInTheDocument();
  },
});
