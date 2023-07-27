import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'button',
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
