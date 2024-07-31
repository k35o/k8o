import type { Meta, StoryObj } from '@storybook/react';
import { LinkButton } from './link-button';
import { ClipboardIcon } from '@heroicons/react/24/solid';

const meta: Meta<typeof LinkButton> = {
  title: 'components/link-button',
  component: LinkButton,
  args: {
    href: '',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LinkButton>;

export const Large: Story = {
  args: {
    size: 'lg',
  },
  render: (props) => {
    return <LinkButton {...props}>ボタン</LinkButton>;
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
  },
  render: (props) => {
    return <LinkButton {...props}>ボタン</LinkButton>;
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
  render: (props) => {
    return <LinkButton {...props}>ボタン</LinkButton>;
  },
};

export const StartIcon: Story = {
  args: {
    startIcon: <ClipboardIcon className="size-6" />,
  },
  render: (props) => {
    return <LinkButton {...props}>ボタン</LinkButton>;
  },
};

export const EndIcon: Story = {
  args: {
    endIcon: <ClipboardIcon className="size-6" />,
  },
  render: (props) => {
    return <LinkButton {...props}>ボタン</LinkButton>;
  },
};
