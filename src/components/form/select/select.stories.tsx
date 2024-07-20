import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './select';

const meta: Meta<typeof Select> = {
  title: 'components/form/select',
  component: Select,
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
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    id: 'select',
    describedbyId: 'select-feedback',
    isDisabled: false,
    isInvalid: false,
    isRequired: false,
  },
};

export const Invalid: Story = {
  args: {
    id: 'select',
    describedbyId: 'select-feedback',
    isDisabled: false,
    isInvalid: true,
    isRequired: false,
  },
};

export const Disabled: Story = {
  args: {
    id: 'select',
    describedbyId: 'select-feedback',
    isDisabled: true,
    isInvalid: false,
    isRequired: false,
  },
};
