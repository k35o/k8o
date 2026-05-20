import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { Cover } from './cover';

const meta: Meta<typeof Cover> = {
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
};

export default meta;
type Story = StoryObj<typeof Cover>;

export const Primary: Story = {
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
};

export const TitleOnly: Story = {
  args: {
    children: <h1>シンプルな表紙</h1>,
  },
};
