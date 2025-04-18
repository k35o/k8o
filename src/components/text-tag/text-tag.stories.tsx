import { TextTag } from './text-tag';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TextTag> = {
  title: 'components/text-tag',
  component: TextTag,
};

export default meta;
type Story = StoryObj<typeof TextTag>;

export const Primary: Story = {
  args: {
    text: 'TypeScript',
  },
};

export const White: Story = {
  args: {
    text: 'TypeScript',
    color: 'white',
  },
};

export const Small: Story = {
  args: {
    text: 'TypeScript',
    color: 'white',
    size: 'sm',
  },
};
