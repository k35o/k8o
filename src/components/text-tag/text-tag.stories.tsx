import type { Meta, StoryObj } from '@storybook/react';
import { TextTag } from './text-tag';

const meta: Meta<typeof TextTag> = {
  title: 'components/text-tag',
  component: TextTag,
  tags: ['autodocs'],
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
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
