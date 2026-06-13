import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { BLOB_CORNERS } from '../../_utils/presets';
import { UiPreview } from './ui-preview';

const meta: Meta<typeof UiPreview> = {
  title: 'app/radius-maker/ui-preview',
  component: UiPreview,
};

export default meta;
type Story = StoryObj<typeof UiPreview>;

export const Primary: Story = {
  args: {
    corners: BLOB_CORNERS,
    shape: 'round',
  },
  play: async ({ canvasElement }) => {
    // 4種類のUI実例が表示される
    const captions = [...canvasElement.querySelectorAll('figcaption')].map(
      (el) => el.textContent,
    );
    await expect(captions).toEqual(['アバター', 'ボタン', 'カード', '画像']);
  },
};

export const Circle: Story = {
  args: {
    corners: {
      topLeft: { x: 50, y: 50 },
      topRight: { x: 50, y: 50 },
      bottomRight: { x: 50, y: 50 },
      bottomLeft: { x: 50, y: 50 },
    },
    shape: 'round',
  },
};
