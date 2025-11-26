import type { Meta, StoryObj } from '@storybook/nextjs-vite';
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
