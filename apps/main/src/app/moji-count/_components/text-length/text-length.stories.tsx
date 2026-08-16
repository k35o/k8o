import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { TextLength } from './text-length';

const meta = preview.meta({
  title: 'app/moji-count/text-length',
  component: TextLength,
});

export const Primary = meta.story({
  args: {
    text: 'Hello, world!',
  },
});

export const CountsEnglishText = meta.story({
  args: {
    text: 'Hello',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('5')).toBeInTheDocument();
  },
});

export const CountsJapaneseText = meta.story({
  args: {
    text: 'こんにちは',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('5')).toBeInTheDocument();
  },
});

export const CountsEmoji = meta.story({
  args: {
    text: '👨‍👩‍👧‍👦',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('1')).toBeInTheDocument();
  },
});

export const CountsMixedText = meta.story({
  args: {
    text: 'Hello こんにちは 🎉',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('13')).toBeInTheDocument();
  },
});

export const CountsEmptyText = meta.story({
  args: {
    text: '',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('0')).toBeInTheDocument();
  },
});
