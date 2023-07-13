import type { Meta, StoryObj } from '@storybook/react';
import { Anchor } from './anchor';

const meta: Meta<typeof Anchor> = {
  title: 'anchor',
  component: Anchor,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Anchor>;

export const External: Story = {
  args: {
    href: 'https://example.com',
    children: 'external link',
  },
};

export const Internal: Story = {
  args: {
    href: '/blog',
    children: 'internal link',
  },
};
