import type { Meta, StoryObj } from '@storybook/react';
import { IconLink } from './icon-link';
import { ClipboardIcon } from '@heroicons/react/24/solid';

const meta: Meta<typeof IconLink> = {
  title: 'components/icon-link',
  component: IconLink,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IconLink>;

export const Large: Story = {
  args: {
    size: 'lg',
    href: 'https://example.com',
    children: <ClipboardIcon className="h-6 w-6" />,
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    href: 'https://example.com',
    children: <ClipboardIcon className="h-6 w-6" />,
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    href: 'https://example.com',
    children: <ClipboardIcon className="h-6 w-6" />,
  },
};
