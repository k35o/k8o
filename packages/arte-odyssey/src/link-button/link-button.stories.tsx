import type { Meta, StoryObj } from '@storybook/react-vite';
import { CopyIcon } from '../icons';
import { LinkButton } from './link-button';

const meta: Meta<typeof LinkButton> = {
  title: 'components/link-button',
  component: LinkButton,
  args: {
    href: '',
    children: 'ボタン',
  },
};

export default meta;
type Story = StoryObj<typeof LinkButton>;

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

export const Outline: Story = {
  args: {
    variant: 'outlined',
  },
};

export const StartIcon: Story = {
  args: {
    startIcon: <CopyIcon />,
  },
};

export const EndIcon: Story = {
  args: {
    endIcon: <CopyIcon />,
  },
};
