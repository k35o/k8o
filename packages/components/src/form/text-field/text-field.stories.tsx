import { TextField } from './text-field';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof TextField> = {
  title: 'components/form/text-field',
  component: TextField,
  args: {
    id: 'textfield',
    describedbyId: 'textfield-feedback',
    value: '',
    onChange: (e) => {
      console.log(e.target.value);
    },
  },
  parameters: {
    a11y: {
      options: {
        rules: {
          // TextField単体ではラベルを付随しない
          'label-title-only': { enabled: false },
          label: { enabled: false },
        },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextField>;

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
    placeholder: 'ID',
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
