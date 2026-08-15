import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { CheckContrast } from './check-contrast';

const meta = preview.meta({
  title: 'app/contrast-checker/check-contrast',
  component: CheckContrast,
});

export const Default = meta.story();

export const InitialContrast = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('コントラスト比 21.00:1'),
    ).toBeInTheDocument();

    await expect(canvas.getByText('APCA Lc -107.9')).toBeInTheDocument();
  },
});

export const ColorInputs = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('背景色')).toBeInTheDocument();
    await expect(canvas.getByText('文字色')).toBeInTheDocument();

    const colorInputs = canvasElement.querySelectorAll('input[type="color"]');
    await expect(colorInputs.length).toBe(2);
  },
});
