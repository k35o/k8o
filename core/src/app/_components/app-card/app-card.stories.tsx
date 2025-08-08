import { LinkIcon } from '@k8o/arte-odyssey/icons';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AppCard } from './app-card';

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
    symbol: <LinkIcon size="lg" />,
    title: 'もじカウント',
    description:
      'テキストの文字数を数えます。ひらがな・カタカナ・漢字・アルファベット・記号・絵文字など、文字の種類を問わず数えられます。',
  },
};
