import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { TextLength } from './text-length';

const meta: Meta<typeof TextLength> = {
  title: 'app/moji-count/text-length',
  component: TextLength,
};

export default meta;
type Story = StoryObj<typeof TextLength>;

export const Primary: Story = {
  args: {
    text: 'Hello, world!',
  },
};

export const CountsEnglishText: Story = {
  args: {
    text: 'Hello',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('5')).toBeInTheDocument();
  },
};

export const CountsJapaneseText: Story = {
  args: {
    text: 'こんにちは',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('5')).toBeInTheDocument();
  },
};

export const CountsEmoji: Story = {
  args: {
    text: '👨‍👩‍👧‍👦',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('1')).toBeInTheDocument();
  },
};

export const CountsMixedText: Story = {
  args: {
    text: 'Hello こんにちは 🎉',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('13')).toBeInTheDocument();
  },
};

export const CountsEmptyText: Story = {
  args: {
    text: '',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('0')).toBeInTheDocument();
  },
};
