import type { Meta, StoryObj } from '@storybook/react';
import { BlogLayout } from './blog-layout';
import { getBlog, getBlogView } from '#src/mocks/actions/blog.mock';

const meta: Meta<typeof BlogLayout> = {
  title: 'app/blog/blog-layout',
  component: BlogLayout,
  beforeEach: () => {
    getBlog.mockResolvedValue({
      id: 1,
      title:
        'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
      description:
        'Reactのルーティングには主にNextjs等のフレームワークやReact Routeが利用されます。この記事では新たなルーティング手法の選択肢としてTanStack Routerを紹介します。TanStack Routerでは最初に挙げた選択肢の使い心地を踏襲しつつ、ルーティングやサーチパラメータの型安全性や他にない便利な機能を提供します。',
      slug: 'tanstack-router-introduction',
      createdAt: new Date('2023/05/01'),
      updatedAt: new Date('2023/07/13'),
    });
    getBlogView.mockResolvedValue(74931);
  },
};

export default meta;
type Story = StoryObj<typeof BlogLayout>;

export const Primary: Story = {
  args: {
    children: 'This is a blog layout',
  },
};
