import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { BLOB_CORNERS } from '../../_utils/presets';
import { OutputPanel } from './output-panel';

const meta = preview.meta({
  title: 'app/radius-maker/output-panel',
  component: OutputPanel,
});

export const Primary = meta.story({
  args: {
    corners: BLOB_CORNERS,
    shape: 'round',
  },
});

export const Simplified = meta.story({
  args: {
    corners: {
      topLeft: { x: 50, y: 50 },
      topRight: { x: 50, y: 50 },
      bottomRight: { x: 50, y: 50 },
      bottomLeft: { x: 50, y: 50 },
    },
    shape: 'round',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('border-radius: 50%;')).toBeInTheDocument();

    await expect(
      canvas.getByRole('button', { name: 'CSSをコピー' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: '共有用URLをコピー' }),
    ).toBeInTheDocument();
  },
});

export const WithCornerShape = meta.story({
  args: {
    corners: BLOB_CORNERS,
    shape: 'squircle',
  },
  play: async ({ canvasElement }) => {
    const code = canvasElement.querySelector('code');
    await expect(code?.textContent).toBe(
      'border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;\ncorner-shape: squircle;',
    );
  },
});
