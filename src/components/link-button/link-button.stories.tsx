import type { Meta, StoryObj } from '@storybook/react';
import { LinkButton } from './link-button';
import { ClipboardPenLine } from 'lucide-react';

const meta: Meta<typeof LinkButton> = {
  title: 'components/link-button',
  component: LinkButton,
  args: {
    href: '',
  },
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
    startIcon: <ClipboardPenLine className="size-6" />,
  },
  render: (props) => {
    return <LinkButton {...props}>ボタン</LinkButton>;
  },
};

export const EndIcon: Story = {
  args: {
    endIcon: <ClipboardPenLine className="size-6" />,
  },
  render: (props) => {
    return <LinkButton {...props}>ボタン</LinkButton>;
  },
};
