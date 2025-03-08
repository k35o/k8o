import { IconLink } from './icon-link';
import { CopyIcon } from '../icons';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof IconLink> = {
  title: 'components/icon-link',
  component: IconLink,
  args: {
    href: 'https://example.com',
    children: <CopyIcon />,
    label: 'Copy to clipboard',
  },
};

export default meta;
type Story = StoryObj<typeof IconLink>;

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

export const BgBase: Story = {
  args: {
    bg: 'base',
  },
};
