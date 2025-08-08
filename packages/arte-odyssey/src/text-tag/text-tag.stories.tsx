import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextTag } from './text-tag';

const meta: Meta<typeof TextTag> = {
  title: 'components/text-tag',
  component: TextTag,
};

export default meta;
type Story = StoryObj<typeof TextTag>;

export const Medium: Story = {
  args: {
    text: 'TypeScript',
    size: 'md',
  },
};

export const Clickable: Story = {
  args: {
    text: 'TypeScript',
    clickable: true,
  },
};

export const Small: Story = {
  args: {
    text: 'TypeScript',
    size: 'sm',
  },
};
