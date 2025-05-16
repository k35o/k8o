import { NewsLayout } from './news-layout';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof NewsLayout> = {
  title: 'app/news/news-layout',
  component: NewsLayout,
};

export default meta;
type Story = StoryObj<typeof NewsLayout>;

export const Primary: Story = {
  args: {
    title: 'お知らせ機能を作成しました。',
    createdAt: '2024-12-28T07:00:00.000Z',
    updatedAt: '2024-12-28T07:00:00.000Z',
  },
};
