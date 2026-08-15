import { expect, within } from 'storybook/test';

import preview from '../../../../../../.storybook/preview';
import { Cover } from './cover';

const meta = preview.meta({
  title: 'app/slides/slide-mdx/cover',
  component: Cover,
  decorators: [
    (Story) => (
      <div
        className="bg-bg-base flex h-svh w-full flex-col"
        style={{ containerType: 'inline-size' }}
      >
        <Story />
      </div>
    ),
  ],
});

export const Primary = meta.story({
  args: {
    children: (
      <>
        <h1>k8oのスライド機能</h1>
        <h2>サンプルプレゼンテーション</h2>
        <p>2026年5月 / k8o</p>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'k8oのスライド機能' }),
    ).toBeInTheDocument();
  },
});

export const TitleOnly = meta.story({
  args: {
    children: <h1>シンプルな表紙</h1>,
  },
});
