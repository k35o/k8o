import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { ColorConverter } from './color-converter';

const meta = preview.meta({
  title: 'app/color-converter/color-converter',
  component: ColorConverter,
});

export const Primary = meta.story();

export const InitialState = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('textbox', { name: 'カラーコード' });
    await expect(input).toHaveValue('#5eead4');

    await expect(canvas.getByRole('spinbutton', { name: 'R' })).toHaveValue(
      '94',
    );
    await expect(canvas.getByRole('spinbutton', { name: 'G' })).toHaveValue(
      '234',
    );
    await expect(canvas.getByRole('spinbutton', { name: 'B' })).toHaveValue(
      '212',
    );
  },
});

export const PasteRgb = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('textbox', { name: 'カラーコード' });
    await userEvent.clear(input);
    await userEvent.type(input, 'rgb(255, 0, 0)');

    await expect(canvas.getByRole('spinbutton', { name: 'R' })).toHaveValue(
      '255',
    );
    await expect(canvas.getByRole('spinbutton', { name: 'G' })).toHaveValue(
      '0',
    );
    await expect(canvas.getByText('rgb(255, 0, 0)')).toBeInTheDocument();
  },
});

export const PasteOklch = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('textbox', { name: 'カラーコード' });
    await userEvent.clear(input);
    await userEvent.type(input, 'oklch(62.8% 0.2577 29.23)');

    await expect(
      canvas.queryByText('認識できない色形式です'),
    ).not.toBeInTheDocument();
    const red = canvas.getByRole('spinbutton', { name: 'R' });
    await expect(Number((red as HTMLInputElement).value)).toBeGreaterThan(250);
  },
});

export const IncompleteInputKeepsColor = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('textbox', { name: 'カラーコード' });
    await userEvent.clear(input);
    await userEvent.type(input, 'rgb(255 0 0)');
    await expect(canvas.getByRole('spinbutton', { name: 'G' })).toHaveValue(
      '0',
    );

    await userEvent.clear(input);
    await userEvent.type(input, '#ff');
    await expect(
      await canvas.findByText('認識できない色形式です'),
    ).toBeInTheDocument();
    await expect(canvas.getByRole('spinbutton', { name: 'R' })).toHaveValue(
      '255',
    );
    await expect(canvas.getByRole('spinbutton', { name: 'G' })).toHaveValue(
      '0',
    );
  },
});

export const EditChannel = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const blue = canvas.getByRole('spinbutton', { name: 'B' });
    await userEvent.clear(blue);
    await userEvent.type(blue, '0');
    await userEvent.tab();

    await expect(canvas.getByText('rgb(94, 234, 0)')).toBeInTheDocument();
  },
});
