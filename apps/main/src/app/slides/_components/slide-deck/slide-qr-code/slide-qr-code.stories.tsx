import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { SlideQRCode } from './slide-qr-code';

const meta: Meta<typeof SlideQRCode> = {
  title: 'app/slides/slide-deck/slide-qr-code',
  component: SlideQRCode,
  decorators: [
    (Story) => (
      <div className="bg-bg-mute size-40 p-2">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SlideQRCode>;

export const Default: Story = {
  args: {
    url: 'https://k8o.me/slides/sample-deck',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const svg = canvas.getByRole('img', { name: /QRコード/u });
    await expect(svg).toBeInTheDocument();
  },
};
