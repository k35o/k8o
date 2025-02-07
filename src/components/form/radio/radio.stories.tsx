import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from './radio';
import { useState } from 'react';

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
        labelId="radio"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        options={options}
        isDisabled={false}
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
        labelId="radio"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        options={options}
        isDisabled
      />
    );
  },
};
