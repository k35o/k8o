import type { Meta, StoryObj } from '@storybook/react';
import { Autocomplete } from './autocomplete';
import { useState } from 'react';

const meta: Meta<typeof Autocomplete> = {
  title: 'components/form/autocomplete',
  component: Autocomplete,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Autocomplete>;

export const Default: Story = {
  render: () => {
    const options = [
      { value: '2', label: '2進数' },
      { value: '8', label: '8進数' },
      { value: '10', label: '10進数' },
      { value: '16', label: '16進数' },
    ];
    const [value, setValue] = useState<string[]>([]);

    return (
      <Autocomplete
        options={options}
        value={value}
        onChange={setValue}
      />
    );
  },
};
