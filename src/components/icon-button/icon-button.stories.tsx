import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './icon-button';
import { ClipboardIcon } from '@heroicons/react/24/solid';

const meta: Meta<typeof IconButton> = {
  title: 'components/button/icon-button',
  component: IconButton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Large: Story = {
  args: {
    size: 'lg',
    onClick: () => {
      console.log('clicked');
    },
    children: <ClipboardIcon className="size-6" />,
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    onClick: () => {
      console.log('clicked');
    },
    children: <ClipboardIcon className="size-6" />,
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    onClick: () => {
      console.log('clicked');
    },
    children: <ClipboardIcon className="size-6" />,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    onClick: () => {
      console.log('clicked');
    },
    children: <ClipboardIcon className="size-6" />,
  },
};
