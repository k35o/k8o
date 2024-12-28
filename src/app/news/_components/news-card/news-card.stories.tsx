import type { Meta, StoryObj } from '@storybook/react';
import { NewsCard } from './news-card';

const meta: Meta<typeof NewsCard> = {
  title: 'app/news/news-card',
  component: NewsCard,
};

export default meta;
type Story = StoryObj<typeof NewsCard>;

export const Primary: Story = {
  args: {
    title: 'お知らせ機能を作成しました。',
    summary:
      'お知らせ機能を作成しました。\nこの機能では、重要なお知らせやアップデート情報、ブログの更新などをアプリ内で確認できます。',
    createdAt: '2024-12-28T07:00:00.000Z',
    updatedAt: '2024-12-28T07:00:00.000Z',
  },
};
