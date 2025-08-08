import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { RangeField } from './range-field';

const meta: Meta<typeof RangeField> = {
  title: 'components/form/RangeField',
  component: RangeField,
  parameters: {
    layout: 'centered',
    a11y: {
      options: {
        rules: {
          // RangeField単体ではラベルを付随しない
          'label-title-only': { enabled: false },
          label: { enabled: false },
        },
      },
    },
  },
  argTypes: {
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<typeof RangeField>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value || 50);
    return (
      <div className="w-80">
        <RangeField
          {...args}
          onChange={(newValue) => {
            setValue(newValue);
            args.onChange(newValue);
          }}
          value={value}
        />
      </div>
    );
  },
  args: {
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    isInvalid: false,
    isDisabled: false,
    isRequired: false,
    showValue: true,
  },
};

export const WithUnit: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value || 200);
    return (
      <div className="w-80">
        <RangeField
          {...args}
          onChange={(newValue) => {
            setValue(newValue);
            args.onChange(newValue);
          }}
          value={value}
        />
      </div>
    );
  },
  args: {
    value: 200,
    min: 100,
    max: 500,
    step: 10,
    unit: 'px',
    isInvalid: false,
    isDisabled: false,
    isRequired: false,
    showValue: true,
  },
};

export const WithoutValue: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value || 75);
    return (
      <div className="w-80">
        <RangeField
          {...args}
          onChange={(newValue) => {
            setValue(newValue);
            args.onChange(newValue);
          }}
          value={value}
        />
      </div>
    );
  },
  args: {
    value: 75,
    min: 0,
    max: 100,
    step: 5,
    showValue: false,
    isInvalid: false,
    isDisabled: false,
    isRequired: false,
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value || 30);
    return (
      <div className="w-80">
        <RangeField
          {...args}
          onChange={(newValue) => {
            setValue(newValue);
            args.onChange(newValue);
          }}
          value={value}
        />
      </div>
    );
  },
  args: {
    value: 30,
    min: 0,
    max: 100,
    step: 1,
    isInvalid: false,
    isDisabled: true,
    isRequired: false,
    showValue: true,
  },
};

export const Invalid: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value || 90);
    return (
      <div className="w-80">
        <RangeField
          {...args}
          onChange={(newValue) => {
            setValue(newValue);
            args.onChange(newValue);
          }}
          value={value}
        />
      </div>
    );
  },
  args: {
    value: 90,
    min: 0,
    max: 100,
    step: 1,
    isInvalid: true,
    isDisabled: false,
    isRequired: false,
    showValue: true,
  },
};
