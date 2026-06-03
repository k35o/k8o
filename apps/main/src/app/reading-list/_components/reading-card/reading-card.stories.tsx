import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { ReadingCard } from './reading-card';

const meta: Meta<typeof ReadingCard> = {
  title: 'app/reading-list/reading-card',
  component: ReadingCard,
  args: {
    url: 'https://example.com/article',
    title: 'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
    publishedAt: '2026-05-20T00:00:00Z',
    imageUrl: '/icon-192.png',
    description:
      'Reactのルーティングには主にNext.js等のフレームワークやReact Routerが利用されます。この記事では新たな選択肢としてTanStack Routerを紹介します。',
    summary: null,
    sourceTitle: 'Zenn',
  },
};

export default meta;
type Story = StoryObj<typeof ReadingCard>;

// 要約が登録済みの記事。説明文より要約を優先して表示する。
export const WithSummary: Story = {
  args: {
    summary: '型安全なルーティングを提供するTanStack Routerの入門記事。',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText(
        'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
      ),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(
        '型安全なルーティングを提供するTanStack Routerの入門記事。',
      ),
    ).toBeInTheDocument();
    await expect(canvas.getByText('Zenn')).toBeInTheDocument();
  },
};

// 要約未登録だが OGP の説明文がある記事。説明文にフォールバックする。
export const WithDescription: Story = {
  args: {
    summary: null,
  },
};

// OGP 画像が取得できなかった記事。テキストのみで成立させる。
export const NoImage: Story = {
  args: {
    imageUrl: null,
  },
};

// 要約も説明文も無い記事。タイトルとメタ情報のみ表示する。
export const TitleOnly: Story = {
  args: {
    imageUrl: null,
    description: null,
    summary: null,
  },
};
