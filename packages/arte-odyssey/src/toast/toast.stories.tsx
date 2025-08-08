import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button';
import { ToastProvider, useToast } from './provider';
import { Toast } from './toast';

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
  render: () => <Toast id="1" message="成功しました" status="success" />,
};

export const ToasInfo: Story = {
  render: () => <Toast id="1" message="情報です" status="info" />,
};

export const ToastError: Story = {
  render: () => <Toast id="1" message="失敗しました" status="error" />,
};

export const ToastWarning: Story = {
  render: () => <Toast id="1" message="警告です" status="warning" />,
};
