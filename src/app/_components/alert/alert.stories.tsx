import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './alert';

const meta: Meta<typeof Alert> = {
  title: 'alert',
  component: Alert,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Success: Story = {
  args: {
    status: 'success',
    message: 'Success',
  },
};

export const Info: Story = {
  args: {
    status: 'info',
    message: 'Info',
  },
};

export const Warning: Story = {
  args: {
    status: 'warning',
    message: 'Warning',
  },
};

export const Error: Story = {
  args: {
    status: 'error',
    message: 'Error',
  },
};

export const ArrayMessage: Story = {
  args: {
    status: 'success',
    message: ['Success1', 'Success2', 'Success3'],
  },
};

export const SingleArrayMessage: Story = {
  args: {
    status: 'success',
    message: ['Success'],
  },
};
