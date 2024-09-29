import type { Meta, StoryObj } from '@storybook/react';
import { BlogCard } from './blog-card';

const meta: Meta<typeof BlogCard> = {
  title: 'app/blog/blog-card',
  component: BlogCard,
};

export default meta;
type Story = StoryObj<typeof BlogCard>;

export const Primary: Story = {
  args: {
    link: '/blog/tanstack-router-introduction' as any,
    title:
      'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
    description:
      'Reactのルーティングには主にNextjs等のフレームワークやReact Routeが利用されます。この記事では新たなルーティング手法の選択肢としてTanStack Routerを紹介します。TanStack Routerでは最初に挙げた選択肢の使い心地を踏襲しつつ、ルーティングやサーチパラメータの型安全性や他にない便利な機能を提供します。',
    createdAt: new Date('2022-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: ['React', 'TypeScript', 'TanStackRouter'],
  },
};
