import { AppCard } from './app-card';
import type { Meta, StoryObj } from '@storybook/nextjs';
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
      'テキストの文字数を数えます。ひらがな・カタカナ・漢字・アルファベット・記号・絵文字など、文字の種類を問わず数えられます。',
  },
};

export const EmotionIsElement: Story = {
  args: {
    link: '/moji-count',
    symbol: <Link className="text-primary-fg size-12" />,
    title: 'もじカウント',
    description:
      'テキストの文字数を数えます。ひらがな・カタカナ・漢字・アルファベット・記号・絵文字など、文字の種類を問わず数えられます。',
  },
};
