import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BlogLayoutContent } from './blog-layout';

const blog = {
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
  title: 'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
  slideUrl: '',
  description:
    'Reactのルーティングには主にNextjs等のフレームワークやReact Routeが利用されます。この記事では新たなルーティング手法の選択肢としてTanStack Routerを紹介します。TanStack Routerでは最初に挙げた選択肢の使い心地を踏襲しつつ、ルーティングやサーチパラメータの型安全性や他にない便利な機能を提供します。',
  createdAt: new Date('2023/05/01'),
  updatedAt: new Date('2023/07/13'),
};

const headingTree = {
  depth: 0 as const,
  children: [
    {
      depth: 1 as const,
      text: '目次',
      children: [
        {
          depth: 2 as const,
          text: 'はじめに',
          children: [],
        },
        {
          depth: 2 as const,
          text: 'TanStack Routerとは',
          children: [],
        },
        {
          depth: 2 as const,
          text: 'TanStack Routerの特徴',
          children: [],
        },
      ],
    },
  ],
};

const recommendedBlogs = [
  {
    id: 11,
    slug: 'atomics-pause',
    title: 'Atomicsで共有メモリ上のデータを安全に取り扱う',
    createdAt: new Date('2025-04-13 02:50:57+00'),
    tags: ['JavaScript', 'Baseline 2025', 'Atomics', 'Atomics.pause'],
  },
  {
    id: 9,
    slug: 'screen-wake-lock',
    title: '画面のスリープを防ぐScreen Wake Lock API',
    createdAt: new Date('2025-04-04 13:43:04.13969+00'),
    tags: ['JavaScript', 'Baseline 2025', 'Screen Wake Lock'],
  },
  {
    id: 10,
    slug: 'async-clipboard',
    title: '任意のデータをコピー&ペーストするClipboard API',
    createdAt: new Date('2025-04-06 10:02:57.807659+00'),
    tags: [
      'JavaScript',
      'Baseline 2025',
      'Clipboard API',
      'ClipboardItem',
      'ClipboardItem supports',
    ],
  },
];

const meta: Meta<typeof BlogLayoutContent> = {
  title: 'app/blog/blog-layout',
  component: BlogLayoutContent,
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
    blog,
    children: 'This is a blog layout',
    headingTree,
    recommendedBlogs,
    slug: 'tanstack-router-introduction',
    viewCount: 74931,
  },
};
