import { BlogLayout } from './blog-layout';
import {
  getBlog,
  getBlogToc,
  getBlogMetadata,
  getBlogView,
  getBlogsByTags,
} from '#src/mocks/services/blog.mock';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof BlogLayout> = {
  title: 'app/blog/blog-layout',
  component: BlogLayout,
  beforeEach: () => {
    getBlog.mockResolvedValue({
      id: 1,
      slug: 'tanstack-router-introduction',
      tags: [
        {
          id: 1,
          name: 'React',
        },
        {
          id: 2,
          name: 'TypeScript',
        },
        {
          id: 3,
          name: 'TanStack Router',
        },
      ],
    });
    getBlogMetadata.mockResolvedValue({
      title:
        'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
      description:
        'Reactのルーティングには主にNextjs等のフレームワークやReact Routeが利用されます。この記事では新たなルーティング手法の選択肢としてTanStack Routerを紹介します。TanStack Routerでは最初に挙げた選択肢の使い心地を踏襲しつつ、ルーティングやサーチパラメータの型安全性や他にない便利な機能を提供します。',
      createdAt: new Date('2023/05/01'),
      updatedAt: new Date('2023/07/13'),
    });
    getBlogView.mockResolvedValue(74931);
    getBlogToc.mockResolvedValue({
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
    getBlogsByTags.mockResolvedValue([
      {
        id: 11,
        slug: 'atomics-pause',
        title: 'Atomicsで共有メモリ上のデータを安全に取り扱う',
        createdAt: '2025-04-13 02:50:57+00',
        tags: [
          'JavaScript',
          'Baseline 2025',
          'Atomics',
          'Atomics.pause',
        ],
      },
      {
        id: 9,
        slug: 'screen-wake-lock',
        title: '画面のスリープを防ぐScreen Wake Lock API',
        createdAt: '2025-04-04 13:43:04.13969+00',
        tags: ['JavaScript', 'Baseline 2025', 'Screen Wake Lock'],
      },
      {
        id: 10,
        slug: 'async-clipboard',
        title: '任意のデータをコピー&ペーストするClipboard API',
        createdAt: '2025-04-06 10:02:57.807659+00',
        tags: [
          'JavaScript',
          'Baseline 2025',
          'Clipboard API',
          'ClipboardItem',
          'ClipboardItem supports',
        ],
      },
    ]);
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
