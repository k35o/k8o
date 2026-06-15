import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { TextField } from './text-field';

const meta: Meta<typeof TextField> = {
  title: 'app/moji-count/text-field',
  component: TextField,
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Primary: Story = {};

export const InputText: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', {
      name: 'カウントしたい文字列',
    });

    await userEvent.type(textarea, 'こんにちは');

    await expect(canvas.getByText('5')).toBeInTheDocument();
  },
};

export const InputLongText: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', {
      name: 'カウントしたい文字列',
    });

    await userEvent.type(textarea, 'これは長いテキストのテストです。');

    await expect(canvas.getByText('16')).toBeInTheDocument();
  },
};
