import type { Meta, StoryObj } from '@storybook/react';
import { AppCard } from './app-card';

const meta: Meta<typeof AppCard> = {
  title: 'app/@modal/app-card',
  component: AppCard,
  tags: ['autodocs'],
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
