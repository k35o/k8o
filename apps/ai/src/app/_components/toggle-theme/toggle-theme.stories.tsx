import { expect, userEvent, within } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { ToggleTheme } from './toggle-theme';

const meta = preview.meta({
  component: ToggleTheme,
});

// 実際のテーマ反映は preview の decorator(ApplyThemeByStorybook)が制御するため、描画と操作可能性のスモークに留める。
export const Default = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', {
      name: 'テーマを切り替える',
    });
    await expect(button).toBeInTheDocument();
    await userEvent.click(button);
    await expect(button).toBeInTheDocument();
  },
});
