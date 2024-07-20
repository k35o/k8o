import type { Meta, StoryObj } from '@storybook/react';
import { FormControl } from './form-control';

const meta: Meta<typeof FormControl> = {
  title: 'components/form/form-control',
  component: FormControl,
  args: {
    renderInput: ({
      id,
      isDisabled,
      isInvalid,
      isRequired,
      describedbyId,
    }) => (
      <input
        id={id}
        type="email"
        aria-describedby={describedbyId}
        className="w-full rounded-md border border-borderLight px-3 py-2 focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focusRing"
        disabled={isDisabled}
        aria-invalid={isInvalid}
        required={isRequired}
      />
    ),
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FormControl>;

export const Default: Story = {
  args: {
    label: 'メールアドレス',
  },
};

export const HelpText: Story = {
  args: {
    label: 'メールアドレス',
    helpText: 'RFCに準拠したメールアドレスを入力してください。',
  },
};

export const Required: Story = {
  args: {
    label: 'メールアドレス',
    helpText: 'RFCに準拠したメールアドレスを入力してください。',
    isRequired: true,
  },
};

export const Error: Story = {
  args: {
    label: 'メールアドレス',
    helpText: 'RFCに準拠したメールアドレスを入力してください。',
    isInvalid: true,
    errorText: 'メールアドレスが正しくありません。',
    isRequired: true,
  },
};

export const ErrorWithoutText: Story = {
  args: {
    label: 'メールアドレス',
    helpText: 'RFCに準拠したメールアドレスを入力してください。',
    isInvalid: true,
    isRequired: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'メールアドレス',
    helpText: 'RFCに準拠したメールアドレスを入力してください。',
    isDisabled: true,
  },
};

export const Legend: Story = {
  args: {
    label: 'メールアドレス',
    helpText: 'RFCに準拠したメールアドレスを入力してください。',
    labelAs: 'legend',
  },
};
