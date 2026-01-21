import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DiffOutput } from './diff-output';

const meta: Meta<typeof DiffOutput> = {
  title: 'app/text-diff/diff-output',
  component: DiffOutput,
};

export default meta;
type Story = StoryObj<typeof DiffOutput>;

export const Empty: Story = {
  args: {
    diff: [],
  },
};

export const NoDifference: Story = {
  args: {
    diff: [{ value: 'こんにちは', added: false, removed: false, count: 5 }],
  },
};

export const Added: Story = {
  args: {
    diff: [{ value: 'こんにちは', added: true, removed: false, count: 5 }],
  },
};

export const Removed: Story = {
  args: {
    diff: [{ value: 'こんにちは', added: false, removed: true, count: 5 }],
  },
};

export const Mixed: Story = {
  args: {
    diff: [
      { value: 'こん', added: false, removed: false, count: 2 },
      { value: 'にち', added: false, removed: true, count: 2 },
      { value: 'ばん', added: true, removed: false, count: 2 },
      { value: 'は', added: false, removed: false, count: 1 },
    ],
  },
};

export const LongText: Story = {
  args: {
    diff: [
      {
        value: '吾輩は猫である。名前はまだ',
        added: false,
        removed: false,
        count: 13,
      },
      { value: '無い', added: false, removed: true, count: 2 },
      { value: 'ある', added: true, removed: false, count: 2 },
      { value: '。どこで生れたか', added: false, removed: false, count: 8 },
      { value: 'とんと見当がつかぬ', added: false, removed: true, count: 9 },
      { value: 'よく覚えている', added: true, removed: false, count: 7 },
      { value: '。', added: false, removed: false, count: 1 },
    ],
  },
};
