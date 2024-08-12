import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { ClipboardPenLine } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'components/button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const FullWidth: Story = {
  args: {
    type: 'button',
    fullWidth: true,
    onClick: () => {
      console.log('clicked');
    },
  },
  render: (props) => {
    return <Button {...props}>ボタン</Button>;
  },
};

export const Outlined: Story = {
  args: {
    type: 'button',
    variant: 'outlined',
    onClick: () => {
      console.log('clicked');
    },
  },
  render: (props) => {
    return <Button {...props}>ボタン</Button>;
  },
};

export const Large: Story = {
  args: {
    type: 'button',
    size: 'lg',
    onClick: () => {
      console.log('clicked');
    },
  },
  render: (props) => {
    return <Button {...props}>ボタン</Button>;
  },
};

export const Medium: Story = {
  args: {
    type: 'button',
    size: 'md',
    onClick: () => {
      console.log('clicked');
    },
  },
  render: (props) => {
    return <Button {...props}>ボタン</Button>;
  },
};

export const Small: Story = {
  args: {
    type: 'button',
    size: 'sm',
    onClick: () => {
      console.log('clicked');
    },
  },
  render: (props) => {
    return <Button {...props}>ボタン</Button>;
  },
};

export const Disabled: Story = {
  args: {
    type: 'button',
    disabled: true,
    onClick: () => {
      console.log('clicked');
    },
  },
  render: (props) => {
    return <Button {...props}>ボタン</Button>;
  },
};
export const DisabledOutlined: Story = {
  args: {
    type: 'button',
    variant: 'outlined',
    disabled: true,
    onClick: () => {
      console.log('clicked');
    },
  },
  render: (props) => {
    return <Button {...props}>ボタン</Button>;
  },
};

export const StartIcon: Story = {
  args: {
    type: 'button',
    onClick: () => {
      console.log('clicked');
    },
    startIcon: <ClipboardPenLine className="size-6" />,
  },
  render: (props) => {
    return <Button {...props}>ボタン</Button>;
  },
};

export const EndIcon: Story = {
  args: {
    type: 'button',
    onClick: () => {
      console.log('clicked');
    },
    endIcon: <ClipboardPenLine className="size-6" />,
  },
  render: (props) => {
    return <Button {...props}>ボタン</Button>;
  },
};
