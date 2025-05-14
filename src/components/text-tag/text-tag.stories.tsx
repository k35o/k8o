import { TextTag } from './text-tag';
import type { Meta, StoryObj } from '@storybook/react';

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

export const Link: Story = {
  args: {
    text: 'TypeScript',
    href: '/tags',
  },
};

export const Small: Story = {
  args: {
    text: 'TypeScript',
    size: 'sm',
  },
};
