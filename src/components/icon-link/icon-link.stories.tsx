import type { Meta, StoryObj } from '@storybook/react';
import { IconLink } from './icon-link';
import { ClipboardPenLine } from 'lucide-react';

const meta: Meta<typeof IconLink> = {
  title: 'components/icon-link',
  component: IconLink,
  args: {
    href: 'https://example.com',
    children: <ClipboardPenLine className="size-6" />,
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
