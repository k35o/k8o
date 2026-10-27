import { useState } from 'react';
import type { ComponentProps, FC } from 'react';
import { expect, screen } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { BlogLayoutContent } from './blog-layout-content';
import { WritingModeProvider } from './writing-mode/writing-mode-context';

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
  createdAt: '2023-05-01T00:00:00.000Z',
  updatedAt: '2023-07-13T00:00:00.000Z',
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
    createdAt: '2025-04-13T02:50:57.000Z',
    tags: ['JavaScript', 'Baseline 2025', 'Atomics', 'Atomics.pause'],
  },
  {
    id: 9,
    slug: 'screen-wake-lock',
    title: '画面のスリープを防ぐScreen Wake Lock API',
    createdAt: '2025-04-04T13:43:04.139Z',
    tags: ['JavaScript', 'Baseline 2025', 'Screen Wake Lock'],
  },
  {
    id: 10,
    slug: 'async-clipboard',
    title: '任意のデータをコピー&ペーストするClipboard API',
    createdAt: '2025-04-06T10:02:57.807Z',
    tags: [
      'JavaScript',
      'Baseline 2025',
      'Clipboard API',
      'ClipboardItem',
      'ClipboardItem supports',
    ],
  },
];

const nextBlog = {
  ...blog,
  id: 2,
  slug: 'next-blog',
  title: '次の記事',
};

// k8ordo の router は、別の記事へ移ると同じ形の木を次の記事の props で当てる。それをボタンで写す
const MoveToNextBlog: FC<ComponentProps<typeof BlogLayoutContent>> = (
  props,
) => {
  const [current, setCurrent] = useState(props.blog);

  return (
    <>
      <button
        onClick={() => {
          setCurrent(nextBlog);
        }}
        type="button"
      >
        次の記事へ移る
      </button>
      <BlogLayoutContent {...props} blog={current} slug={current.slug} />
    </>
  );
};

const meta = preview.meta({
  title: 'app/blog/blog-layout',
  component: BlogLayoutContent,
  decorators: [
    (Story) => (
      <WritingModeProvider>
        <Story />
      </WritingModeProvider>
    ),
  ],
});

export const Primary = meta.story({
  args: {
    blog,
    children: 'This is a blog layout',
    headingTree,
    recommendedBlogs,
    slug: 'tanstack-router-introduction',
    readingTime: 5,
  },
});

export const ResetFeedbackDraftOnNavigation = Primary.extend({
  render: (args) => <MoveToNextBlog {...args} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '良い' }));
    await userEvent.type(canvas.getByRole('textbox'), '参考になりました');

    await userEvent.click(
      canvas.getByRole('button', { name: '次の記事へ移る' }),
    );

    await expect(
      await canvas.findByRole('heading', { name: nextBlog.title }),
    ).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: '良い' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await expect(canvas.getByRole('textbox')).toHaveValue('');
  },
});

export const ResetFeedbackSentOnNavigation = Primary.extend({
  render: (args) => <MoveToNextBlog {...args} />,
  // 送信のトーストは数秒で自動で閉じるので、撮影の時機で写り方が変わらないよう外す
  parameters: { vrt: { remove: '[data-toast-id]' } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '良い' }));
    await userEvent.click(canvas.getByRole('button', { name: '送信' }));
    await screen.findByText('フィードバックを送信しました！');
    await canvas.findByText('フィードバックありがとうございます！');

    await userEvent.click(
      canvas.getByRole('button', { name: '次の記事へ移る' }),
    );

    await expect(
      await canvas.findByRole('heading', { name: nextBlog.title }),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByText('フィードバックありがとうございます！'),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: '送信' }),
    ).toBeInTheDocument();
  },
});
