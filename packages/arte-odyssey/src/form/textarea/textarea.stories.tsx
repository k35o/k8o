import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './textarea';

const meta: Meta<typeof Textarea> = {
  title: 'components/form/textarea',
  component: Textarea,
  decorators: [
    (Story) => (
      <div className="h-screen">
        <Story />
      </div>
    ),
  ],
  args: {
    id: 'textarea',
    describedbyId: 'textarea-feedback',
    value: '10',
    onChange: (e) => {
      console.log(e.target.value);
    },
  },
  parameters: {
    a11y: {
      options: {
        rules: {
          // TextArea単体ではラベルを付随しない
          label: { enabled: false },
          'label-title-only': { enabled: false },
        },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    isDisabled: false,
    isInvalid: false,
    isRequired: false,
  },
};

export const FullHeight: Story = {
  args: {
    isDisabled: false,
    isInvalid: false,
    isRequired: false,
    fullHeight: true,
  },
};

export const AutoResize: Story = {
  args: {
    isDisabled: false,
    isInvalid: false,
    isRequired: false,
    autoResize: true,
  },
};

export const Rows: Story = {
  args: {
    isDisabled: false,
    isInvalid: false,
    isRequired: false,
    rows: 10,
  },
};

export const Placeholder = {
  args: {
    isDisabled: false,
    isInvalid: false,
    isRequired: false,
    placeholder: '10進数',
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
