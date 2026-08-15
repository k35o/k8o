import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { ToggleTheme } from './toggle-theme';

const meta = preview.meta({
  title: 'admin/toggle-theme',
  component: ToggleTheme,
});

export const Primary = meta.story();

export const DisplaysToggleButton = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: 'テーマを切り替える' }),
    ).toBeInTheDocument();
  },
});
