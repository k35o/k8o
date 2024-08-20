import type { Meta, StoryObj } from '@storybook/react';
import { BlogCard } from './blog-card';

const meta: Meta<typeof BlogCard> = {
  title: 'app/@modal/blog/blog-card',
  component: BlogCard,
};

export default meta;
type Story = StoryObj<typeof BlogCard>;

export const Primary: Story = {
  args: {
    link: '/blog/tanstack-router-introduction' as any,
    emotion: '😃',
    title:
      'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
    tags: ['React', 'TypeScript', 'TanStackRouter'],
  },
};
