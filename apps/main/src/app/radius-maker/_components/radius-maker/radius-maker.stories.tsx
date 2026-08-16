import type { ComponentProps } from 'react';
import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { RadiusMaker } from './radius-maker';

const meta = preview.meta({
  title: 'app/radius-maker/radius-maker',
  component: RadiusMaker,
  // ネストしたunionリテラル（status・browser）のままargsを推論させると
  // meta.storyの型推論が壊れるため、satisfiesで文脈型を与えて広げる
  args: {
    cornerShapeStatus: {
      featureId: 'corner-shape',
      name: 'corner-shape',
      status: 'limited',
      baselineDate: null,
      resolvedDate: '2025-08-05',
      support: [
        { browser: 'chrome', version: '139', date: '2025-08-05' },
        { browser: 'chrome_android', version: '139', date: '2025-08-05' },
        { browser: 'edge', version: '139', date: '2025-08-05' },
      ],
    },
  } satisfies Partial<ComponentProps<typeof RadiusMaker>>,
});

export const Primary = meta.story();

export const InitialState = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const sliders = canvas.getAllByRole('slider');
    await expect(sliders).toHaveLength(8);

    const blobButton = canvas.getByRole('button', { name: 'ブロブ' });
    await expect(blobButton).toHaveAttribute('aria-pressed', 'true');

    await expect(
      canvas.getByText('border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;'),
    ).toBeInTheDocument();
  },
});

export const SelectPreset = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: '円' }));
    await expect(canvas.getByText('border-radius: 50%;')).toBeInTheDocument();

    const fields = canvas.getAllByRole('spinbutton', { name: '水平' });
    await Promise.all(fields.map((field) => expect(field).toHaveValue('50')));
  },
});

export const SelectCornerShape = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: 'かたち(corner-shape)' }),
      'squircle',
    );
    const code = canvasElement.querySelector('code');
    await expect(code?.textContent).toContain('corner-shape: squircle;');
  },
});

export const KeyboardOperation = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const slider = canvas.getByRole('slider', {
      name: '左上の水平方向の丸み',
    });
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(slider).toHaveAttribute('aria-valuenow', '31');
    await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    await expect(slider).toHaveAttribute('aria-valuenow', '21');
  },
});
