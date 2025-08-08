import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
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
