import type { Meta, StoryObj } from '@storybook/react';
import { NumberField } from './number-field';
import { useState } from 'react';

const meta: Meta<typeof NumberField> = {
  title: 'components/form/number-field',
  component: NumberField,
  args: {
    id: 'textfield',
    describedbyId: 'numberfield-feedback',
  },
  render: (args) => {
    const [value, setValue] = useState(0);
    return (
      <NumberField {...args} value={value} onChange={setValue} />
    );
  },
};

export default meta;
type Story = StoryObj<typeof NumberField>;

export const Default: Story = {
  args: {
    isDisabled: false,
    isInvalid: false,
    isRequired: false,
  },
};

export const Placeholder: Story = {
  args: {
    isDisabled: false,
    isInvalid: false,
    isRequired: false,
    placeholder: '10.2',
  },
};

export const Invalid: Story = {
  args: {
    isDisabled: false,
    isInvalid: true,
    isRequired: false,
  },
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
    isInvalid: false,
    isRequired: false,
  },
};
