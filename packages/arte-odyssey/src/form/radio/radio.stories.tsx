import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Radio } from './radio';

const meta: Meta<typeof Radio> = {
  title: 'components/form/radio',
  component: Radio,
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Default: Story = {
  render: () => {
    const options = [
      { value: '0', label: 'はい' },
      { value: '1', label: 'いいえ' },
    ];
    const [value, setValue] = useState('0');

    return (
      <Radio
        isDisabled={false}
        labelId="radio"
        onChange={(e) => {
          setValue(e.target.value);
        }}
        options={options}
        value={value}
      />
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const options = [
      { value: '0', label: 'はい' },
      { value: '1', label: 'いいえ' },
    ];
    const [value, setValue] = useState('0');

    return (
      <Radio
        isDisabled
        labelId="radio"
        onChange={(e) => {
          setValue(e.target.value);
        }}
        options={options}
        value={value}
      />
    );
  },
};
