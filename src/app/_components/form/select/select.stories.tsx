import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './select';

const meta: Meta<typeof Select> = {
  title: 'form/select',
  component: Select,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    options: [
      { value: '2', label: '2進数' },
      { value: '8', label: '8進数' },
      { value: '10', label: '10進数' },
      { value: '16', label: '16進数' },
    ],
    value: '10',
    onChange: (value: string) => console.log(value),
  },
};
