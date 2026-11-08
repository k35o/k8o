import { expect, userEvent, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { WritingModeContent } from './writing-mode-content';
import { WritingModeProvider } from './writing-mode-context';
import { WritingModeSwitcher } from './writing-mode-switcher';

const meta = preview.meta({
  title: 'app/blog/blog-layout/writing-mode-content',
  component: WritingModeContent,
  decorators: [
    (Story) => (
      <WritingModeProvider>
        <WritingModeSwitcher />
        <Story />
      </WritingModeProvider>
    ),
  ],
  args: {
    children: (
      <p>
        本文の <code>display</code> のあとに続く文字。
      </p>
    ),
  },
});

export const Horizontal = meta.story({
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByText('display')).display).toBe(
      'inline',
    );
  },
});

export const Vertical = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '横書きモード' }));

    const code = within(
      canvas.getByRole('region', { name: '縦書き本文' }),
    ).getByText('display');
    await expect(getComputedStyle(code).display).toBe('inline-block');
    await expect(getComputedStyle(code).textIndent).toBe('0px');
  },
});
