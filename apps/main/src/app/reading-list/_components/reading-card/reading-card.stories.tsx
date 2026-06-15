import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ReadingCard } from './reading-card';

const meta: Meta<typeof ReadingCard> = {
  title: 'app/reading-list/reading-card',
  component: ReadingCard,
  args: {
    articleId: 1,
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

export const WithDescription: Story = {
  args: {
    summary: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'AIで要約' }),
    ).toBeInTheDocument();
  },
};

export const GenerateSummary: Story = {
  args: {
    summary: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'AIで要約' }));
    await expect(
      await canvas.findByText('モック要約：この記事の要点を1〜2文で表します。'),
    ).toBeInTheDocument();
  },
};

export const ExpandableBody: Story = {
  args: {
    summary:
      '型安全なルーティングを提供するTanStack Routerの入門記事。ファイルベースルーティング、検索パラメータの型付け、データローダー、コード分割、認証ガードまで、実プロジェクトで必要になる要素を一通り順を追って解説しており、Next.jsやReact Routerからの移行も具体例つきで触れられている。',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const expand = await canvas.findByRole('button', { name: '続きを読む' });
    await userEvent.click(expand);

    await waitFor(() => {
      expect(
        canvas.queryByRole('button', { name: '続きを読む' }),
      ).not.toBeInTheDocument();
    });
  },
};

export const NoImage: Story = {
  args: {
    imageUrl: null,
  },
};

export const TitleOnly: Story = {
  args: {
    imageUrl: null,
    description: null,
    summary: null,
  },
};
