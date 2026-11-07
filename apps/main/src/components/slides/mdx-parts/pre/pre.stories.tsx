import { expect } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { Pre } from './pre';

// アプリでは mdx-base が読み込むため、Storybook では Story 側で読み込む
import '@repo/code-highlight/styles.css';

const KEYWORD = { light: 'rgb(157, 26, 156)', dark: 'rgb(97, 175, 239)' };

// rehype の shiki が出す形に合わせ、pre に class と style を付け、code-annotate-block の div で包む
const meta = preview.meta({
  title: 'app/slides/mdx-parts/pre',
  component: Pre,
  args: {
    className: 'shiki shiki-themes one-light plastic',
    style: {
      backgroundColor: '#FAFAFA',
      '--shiki-dark-bg': '#21252B',
      color: '#383A42',
      '--shiki-dark': '#A9B2C3',
    },
    children: (
      <code>
        <span className="line">
          <span style={{ color: '#9d1a9c', '--shiki-dark': '#61AFEF' }}>
            const
          </span>
        </span>
      </code>
    ),
  },
  decorators: [
    (Story) => (
      <div className="code-annotate-block" data-label="ts">
        <Story />
      </div>
    ),
  ],
});

const subtleOf = (canvasElement: HTMLElement): string => {
  const probe = document.createElement('div');
  probe.style.backgroundColor = 'var(--color-bg-subtle)';
  canvasElement.append(probe);
  const color = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return color;
};

// 正常系: light では one-light の字の色で、面はスライドの --color-bg-subtle のまま
export const Light = meta.story({
  parameters: { theme: 'light' },
  play: async ({ canvas, canvasElement }) => {
    const pre = canvasElement.querySelector('pre');
    await expect(pre).not.toBeNull();
    await expect(getComputedStyle(pre ?? document.body).backgroundColor).toBe(
      subtleOf(canvasElement),
    );
    await expect(canvas.getByText('const')).toHaveStyle({
      color: KEYWORD.light,
    });
  },
});

// 正常系: dark では plastic の字の色に替わり、面はテーマの背景でなくスライドの --color-bg-subtle のまま
export const Dark = meta.story({
  parameters: { theme: 'dark' },
  play: async ({ canvas, canvasElement }) => {
    const pre = canvasElement.querySelector('pre');
    await expect(pre).not.toBeNull();
    await expect(getComputedStyle(pre ?? document.body).backgroundColor).toBe(
      subtleOf(canvasElement),
    );
    await expect(canvas.getByText('const')).toHaveStyle({
      color: KEYWORD.dark,
    });
  },
});
