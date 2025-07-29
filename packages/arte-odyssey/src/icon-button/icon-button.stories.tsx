import { IconButton } from './icon-button';
import { CopyIcon } from '../icons';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof IconButton> = {
  title: 'components/button/icon-button',
  component: IconButton,
  args: {
    onClick: () => {
      console.log('clicked');
    },
    label: 'Copy',
    children: <CopyIcon />,
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const BgBase: Story = {
  args: {
    bg: 'base',
  },
};

export const BgPrimary: Story = {
  args: {
    bg: 'primary',
  },
};
