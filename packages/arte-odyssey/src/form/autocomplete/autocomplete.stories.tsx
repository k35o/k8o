import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Autocomplete } from './autocomplete';

const meta: Meta<typeof Autocomplete> = {
  title: 'components/form/autocomplete',
  component: Autocomplete,
  render: (props) => {
    const options = [
      { value: '2', label: '2進数' },
      { value: '8', label: '8進数' },
      { value: '10', label: '10進数' },
      { value: '16', label: '16進数' },
    ];
    const [value, setValue] = useState<string[]>([]);

    return (
      <Autocomplete
        {...props}
        onChange={setValue}
        options={options}
        value={value}
      />
    );
  },
};

export default meta;
type Story = StoryObj<typeof Autocomplete>;

export const Default: Story = {
  args: {
    id: 'autocomplete',
    describedbyId: undefined,
    isInvalid: false,
    isDisabled: false,
    isRequired: false,
  },
};

export const Invalid: Story = {
  args: {
    id: 'autocomplete',
    describedbyId: undefined,
    isInvalid: true,
    isDisabled: false,
    isRequired: true,
  },
};

export const Disabled: Story = {
  args: {
    id: 'autocomplete',
    describedbyId: undefined,
    isInvalid: false,
    isDisabled: true,
    isRequired: true,
  },
};
