import type { Meta, StoryObj } from '@storybook/react-vite';
import { Anchor } from './anchor';

const meta: Meta<typeof Anchor> = {
  title: 'components/anchor',
  component: Anchor,
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
