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
    link: '/characters/counter',
    emotion: '📏',
    title: '文字数カウンター',
    description: '入力した文字列の長さをカウントします。',
  },
};

export const EmotionIsElement: Story = {
  args: {
    link: '/characters/counter',
    emotion: <Link className="size-24 text-textHighlight" />,
    title: '文字数カウンター',
    description: '入力した文字列の長さをカウントします。',
  },
};
