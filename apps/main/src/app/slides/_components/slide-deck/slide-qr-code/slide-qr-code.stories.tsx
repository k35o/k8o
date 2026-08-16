import { expect, within } from 'storybook/test';

import preview from '../../../../../../.storybook/preview';
import { SlideQRCode } from './slide-qr-code';

const meta = preview.meta({
  title: 'app/slides/slide-deck/slide-qr-code',
  component: SlideQRCode,
  decorators: [
    (Story) => (
      <div className="bg-bg-mute size-40 p-2">
        <Story />
      </div>
    ),
  ],
});

export const Default = meta.story({
  args: {
    url: 'https://k8o.me/slides/sample-deck',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const svg = canvas.getByRole('img', { name: /QRコード/u });
    await expect(svg).toBeInTheDocument();
  },
});
