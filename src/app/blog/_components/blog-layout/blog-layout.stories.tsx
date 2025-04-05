import { BlogLayout } from './blog-layout';
import { getBlog, getBlogView } from '#src/mocks/actions/blog.mock';
import { getTocTreeWithCache } from '#src/mocks/utils/mdx/toc-tree.mock';
import type { Meta, StoryObj } from '@storybook/react';

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
      tags: ['React', 'TypeScript', 'TanStackRouter'],
    });
    getBlogView.mockResolvedValue(74931);
    getTocTreeWithCache.mockResolvedValue({
      depth: 0,
      children: [
        {
          depth: 1,
          text: '目次',
          children: [
            {
              depth: 2,
              text: 'はじめに',
              children: [],
            },
            {
              depth: 2,
              text: 'TanStack Routerとは',
              children: [],
            },
            {
              depth: 2,
              text: 'TanStack Routerの特徴',
              children: [],
            },
          ],
        },
      ],
    });
  },
  decorators: [
    (Story) => (
      <div className="ml-24 max-w-5xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BlogLayout>;

export const Primary: Story = {
  args: {
    children: 'This is a blog layout',
    slug: 'tanstack-router-introduction',
  },
};
