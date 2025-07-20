import { ToastProvider, useToast } from './provider';
import { Button } from '../button';
import { Toast } from './toast';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ToastProvider> = {
  title: 'components/toast',
  component: ToastProvider,
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  render: () => {
    const { onOpen } = useToast();
    return (
      <Button
        onClick={() => {
          onOpen('success', 'トーストを呼びました');
        }}
      >
        トーストを呼ぶ
      </Button>
    );
  },
};

export default meta;
type Story = StoryObj<typeof ToastProvider>;

export const Primary: Story = {};

export const ToastSuccess: Story = {
  render: () => (
    <Toast id="1" status="success" message="成功しました" />
  ),
};

export const ToasInfo: Story = {
  render: () => <Toast id="1" status="info" message="情報です" />,
};

export const ToastError: Story = {
  render: () => (
    <Toast id="1" status="error" message="失敗しました" />
  ),
};

export const ToastWarning: Story = {
  render: () => <Toast id="1" status="warning" message="警告です" />,
};
