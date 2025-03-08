import { IconButton } from './icon-button';
import { CopyIcon } from '../icons';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof IconButton> = {
  title: 'components/button/icon-button',
  component: IconButton,
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Large: Story = {
  args: {
    size: 'lg',
    onClick: () => {
      console.log('clicked');
    },
    children: <CopyIcon />,
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    onClick: () => {
      console.log('clicked');
    },
    children: <CopyIcon />,
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    onClick: () => {
      console.log('clicked');
    },
    children: <CopyIcon />,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    onClick: () => {
      console.log('clicked');
    },
    children: <CopyIcon />,
  },
};

export const BgBase: Story = {
  args: {
    bg: 'base',
    onClick: () => {
      console.log('clicked');
    },
    children: <CopyIcon />,
  },
};
