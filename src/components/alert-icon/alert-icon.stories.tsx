import { AlertIcon } from './alert-icon';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof AlertIcon> = {
  title: 'components/alert-icon',
  component: AlertIcon,
};

export default meta;
type Story = StoryObj<typeof AlertIcon>;

export const Success: Story = {
  args: {
    status: 'success',
  },
};

export const Info: Story = {
  args: {
    status: 'info',
  },
};

export const Warning: Story = {
  args: {
    status: 'warning',
  },
};

export const Error: Story = {
  args: {
    status: 'error',
  },
};
