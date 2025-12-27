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

    // フィードバックオプションを選択
    const radioButtons = canvas.getAllByRole('radio');
    const firstRadio = radioButtons[0];
    if (!firstRadio) throw new Error('Radio button not found');

    await userEvent.click(firstRadio);

    // 選択状態を確認
    await expect(firstRadio).toHaveAttribute('aria-checked', 'true');

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

    // コメントを入力
    const textarea = canvas.getByRole('textbox', { name: 'コメント' });
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

    // フィードバックを選択
    const radioButtons = canvas.getAllByRole('radio');
    const firstRadio = radioButtons[0];
    if (!firstRadio) throw new Error('Radio button not found');

    await userEvent.click(firstRadio);

    // コメントを入力
    const textarea = canvas.getByRole('textbox', { name: 'コメント' });
    await userEvent.type(textarea, 'ありがとうございます');

    // 送信
    const submitButton = canvas.getByRole('button', { name: '送信' });
    await userEvent.click(submitButton);

    // onSubmitが呼ばれたことを確認
    await expect(args.onSubmit).toHaveBeenCalled();
  },
};
