import { expect, userEvent, waitFor, within } from 'storybook/test';

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

// color-scheme は next-themes に inline で書かせず、@k8ordo/ui の CSS が class から決める
export const Dark = meta.story({
  parameters: { theme: 'dark' },
  play: async () => {
    const root = document.documentElement;
    await waitFor(async () => {
      await expect(root).toHaveClass('dark');
    });
    await expect(root.style.colorScheme).toBe('');
    await expect(getComputedStyle(root).colorScheme).toBe('dark');
  },
});
