import { NumberField } from './number-field';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect } from 'storybook/test';

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
  parameters: {
    a11y: {
      options: {
        rules: {
          // NumberField単体ではラベルを付随しない
          'label-title-only': { enabled: false },
          label: { enabled: false },
        },
      },
    },
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
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('spinbutton');
    await userEvent.type(input, '2.0[Tab]');

    await expect(input).toHaveValue('2');

    await userEvent.click(input);

    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');

    await expect(input).toHaveValue('0');
  },
};

export const Min0Max100: Story = {
  args: {
    isDisabled: false,
    isInvalid: false,
    isRequired: false,
    min: 0,
    max: 100,
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('spinbutton');
    await userEvent.type(input, '-10[Tab]');

    await expect(input).toHaveValue('0');

    await userEvent.keyboard('{ArrowDown}');

    await expect(input).toHaveValue('0');

    await userEvent.type(input, '111[Tab]');

    await expect(input).toHaveValue('100');

    await userEvent.keyboard('{ArrowUp}');

    await expect(input).toHaveValue('100');
  },
};

export const Precision: Story = {
  args: {
    isDisabled: false,
    isInvalid: false,
    isRequired: false,
    precision: 2,
    step: 0.01,
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
