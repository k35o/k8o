import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';
import { FeedbackCard } from './feedback-card';

const meta: Meta<typeof FeedbackCard> = {
  title: 'app/globals/feedback-card',
  component: FeedbackCard,
  decorators: [
    (Story) => (
      <div className="bg-bg-base p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FeedbackCard>;

export const Primary: Story = {
  args: {
    title: 'この記事はどうでしたか？',
    onSubmit: fn(),
  },
};

export const SelectFeedback: Story = {
  args: {
    title: 'この記事はどうでしたか？',
    onSubmit: fn(() => Promise.resolve()),
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // 「良い」ボタンをクリックして選択状態になる
    const goodButton = canvas.getByRole('button', { name: '良い' });
    await userEvent.click(goodButton);

    // 送信ボタンが有効になることを確認
    const submitButton = canvas.getByRole('button', { name: '送信' });
    await expect(submitButton).not.toBeDisabled();
  },
};

export const InputComment: Story = {
  args: {
    title: 'この記事はどうでしたか？',
    onSubmit: fn(() => Promise.resolve()),
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // コメント欄がデフォルトで表示されている
    const textarea = canvas.getByRole('textbox');
    await userEvent.type(textarea, 'とても参考になりました！');

    // 送信ボタンが有効になることを確認
    const submitButton = canvas.getByRole('button', { name: '送信' });
    await expect(submitButton).not.toBeDisabled();
  },
};

export const SubmitFeedback: Story = {
  args: {
    title: 'この記事はどうでしたか？',
    onSubmit: fn(() => Promise.resolve()),
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);

    // 「良い」ボタンをクリック（コメント欄が開いているので即送信されない）
    const goodButton = canvas.getByRole('button', { name: '良い' });
    await userEvent.click(goodButton);

    // コメントを入力
    const textarea = canvas.getByRole('textbox');
    await userEvent.type(textarea, 'ありがとうございます');

    // 送信
    const submitButton = canvas.getByRole('button', { name: '送信' });
    await userEvent.click(submitButton);

    // onSubmitが呼ばれたことを確認
    await expect(args.onSubmit).toHaveBeenCalled();
  },
};
