import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './select';

const meta: Meta<typeof Select> = {
  title: 'components/form/select',
  component: Select,
  args: {
    id: 'select',
    describedbyId: 'select-feedback',
    options: [
      { value: '2', label: '2進数' },
      { value: '8', label: '8進数' },
      { value: '10', label: '10進数' },
      { value: '16', label: '16進数' },
    ],
    value: '10',
    onChange: (e) => {
      console.log(e.target.value);
    },
  },
  parameters: {
    a11y: {
      options: {
        rules: {
          // Select単体ではラベルを付随しない
          'label-title-only': { enabled: false },
          'select-name': { enabled: false },
        },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    isDisabled: false,
    isInvalid: false,
    isRequired: false,
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
