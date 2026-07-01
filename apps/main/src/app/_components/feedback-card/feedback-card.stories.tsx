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
    onSubmit: fn(() => Promise.resolve(true)),
  },
};

export const SelectFeedback: Story = {
  args: {
    title: 'この記事はどうでしたか？',
    onSubmit: fn(() => Promise.resolve(true)),
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const goodButton = canvas.getByRole('button', { name: '良い' });
    await userEvent.click(goodButton);

    const submitButton = canvas.getByRole('button', { name: '送信' });
    await expect(submitButton).not.toBeDisabled();
  },
};

export const InputComment: Story = {
  args: {
    title: 'この記事はどうでしたか？',
    onSubmit: fn(() => Promise.resolve(true)),
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const textarea = canvas.getByRole('textbox');
    await userEvent.type(textarea, 'とても参考になりました！');

    const submitButton = canvas.getByRole('button', { name: '送信' });
    await expect(submitButton).not.toBeDisabled();
  },
};

export const SubmitFeedback: Story = {
  args: {
    title: 'この記事はどうでしたか？',
    onSubmit: fn(() => Promise.resolve(true)),
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);

    const goodButton = canvas.getByRole('button', { name: '良い' });
    await userEvent.click(goodButton);

    const textarea = canvas.getByRole('textbox');
    await userEvent.type(textarea, 'ありがとうございます');

    const submitButton = canvas.getByRole('button', { name: '送信' });
    await userEvent.click(submitButton);

    await expect(args.onSubmit).toHaveBeenCalled();
    await expect(
      await canvas.findByText('フィードバックありがとうございます！'),
    ).toBeInTheDocument();
  },
};

export const SubmitFailureKeepsForm: Story = {
  args: {
    title: 'この記事はどうでしたか？',
    onSubmit: fn(() => Promise.resolve(false)),
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: '良い' }));
    await userEvent.click(canvas.getByRole('button', { name: '送信' }));

    await expect(args.onSubmit).toHaveBeenCalled();
    // 送信失敗時はフォームを維持し、再送できるようにする
    await expect(
      await canvas.findByRole('button', { name: '送信' }),
    ).toBeInTheDocument();
  },
};
