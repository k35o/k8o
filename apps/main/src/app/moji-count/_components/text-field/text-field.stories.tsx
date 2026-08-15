import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { TextField } from './text-field';

const meta = preview.meta({
  title: 'app/moji-count/text-field',
  component: TextField,
});

export const Primary = meta.story();

export const InputText = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', {
      name: 'カウントしたい文字列',
    });

    await userEvent.type(textarea, 'こんにちは');

    await expect(canvas.getByText('5')).toBeInTheDocument();
  },
});

export const InputLongText = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', {
      name: 'カウントしたい文字列',
    });

    await userEvent.type(textarea, 'これは長いテキストのテストです。');

    await expect(canvas.getByText('16')).toBeInTheDocument();
  },
});
