import { expect } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { BLOB_CORNERS } from '../../_utils/presets';
import { UiPreview } from './ui-preview';

const meta = preview.meta({
  title: 'app/radius-maker/ui-preview',
  component: UiPreview,
});

export const Primary = meta.story({
  args: {
    corners: BLOB_CORNERS,
    shape: 'round',
  },
  play: async ({ canvasElement }) => {
    const captions = [...canvasElement.querySelectorAll('figcaption')].map(
      (el) => el.textContent,
    );
    await expect(captions).toEqual(['アバター', 'ボタン', 'カード', '画像']);
  },
});

export const Circle = meta.story({
  args: {
    corners: {
      topLeft: { x: 50, y: 50 },
      topRight: { x: 50, y: 50 },
      bottomRight: { x: 50, y: 50 },
      bottomLeft: { x: 50, y: 50 },
    },
    shape: 'round',
  },
});
