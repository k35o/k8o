import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { Stage } from './stage';

const meta: Meta<typeof Stage> = {
  title: 'app/slides/slide-deck/stage',
  component: Stage,
  decorators: [
    (Story) => (
      <div className="h-svh w-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Stage>;

export const Empty: Story = {
  args: {
    children: null,
  },
};

export const WithContent: Story = {
  args: {
    children: (
      <>
        <h2>サンプル見出し</h2>
        <p>ステージは 16:9 を維持しながら親要素にフィットします。</p>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { name: 'サンプル見出し' }),
    ).toBeInTheDocument();
  },
};

export const WithQRCode: Story = {
  args: {
    qrUrl: 'https://k8o.me/slides/sample-deck',
    children: <h2>QR 付き</h2>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('img', { name: /QRコード/ }),
    ).toBeInTheDocument();
  },
};
