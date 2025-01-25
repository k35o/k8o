import type { Meta, StoryObj } from '@storybook/react';
import { AppCard } from './app-card';
import { Link } from 'lucide-react';

const meta: Meta<typeof AppCard> = {
  title: 'app/globals/app-card',
  component: AppCard,
};

export default meta;
type Story = StoryObj<typeof AppCard>;

export const Primary: Story = {
  args: {
    link: '/moji-count',
    symbol: '📏',
    title: 'もじカウント',
    description:
      'テキストの文字数を簡単かつ正確にカウントできるシンプルなツールです。日本語、英語、記号、絵文字、テキストの種類を問わず分析できます。',
  },
};

export const EmotionIsElement: Story = {
  args: {
    link: '/moji-count',
    symbol: <Link className="text-text-highlight size-12" />,
    title: 'もじカウント',
    description:
      'テキストの文字数を簡単かつ正確にカウントできるシンプルなツールです。日本語、英語、記号、絵文字、テキストの種類を問わず分析できます。',
  },
};
