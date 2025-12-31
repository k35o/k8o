import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { BlogCard } from './blog-card';

const meta: Meta<typeof BlogCard> = {
  title: 'app/blog/blog-card',
  component: BlogCard,
};

export default meta;
type Story = StoryObj<typeof BlogCard>;

export const Primary: Story = {
  args: {
    slug: 'tanstack-router-introduction',
    tags: ['React', 'TypeScript', 'TanStackRouter'],
    title: 'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ',
    description:
      'Reactのルーティングには主にNextjs等のフレームワークやReact Routeが利用されます。この記事では新たなルーティング手法の選択肢としてTanStack Routerを紹介します。TanStack Routerでは最初に挙げた選択肢の使い心地を踏襲しつつ、ルーティングやサーチパラメータの型安全性や他にない便利な機能を提供します。',
    createdAt: new Date('2023/05/01'),
    updatedAt: new Date('2023/07/13'),
  },
};

export const DisplaysTitle: Story = {
  args: {
    slug: 'test-slug',
    tags: ['React'],
    title: 'テスト記事のタイトル',
    description: 'テスト説明文',
    createdAt: new Date('2024/01/15'),
    updatedAt: new Date('2024/02/20'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // タイトルが表示されていることを確認
    await expect(
      canvas.getByRole('heading', { name: 'テスト記事のタイトル' }),
    ).toBeInTheDocument();
  },
};

export const DisplaysTags: Story = {
  args: {
    slug: 'test-slug',
    tags: ['React', 'TypeScript', 'Next.js'],
    title: 'テスト記事',
    description: null,
    createdAt: new Date('2024/01/15'),
    updatedAt: new Date('2024/02/20'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // タグが表示されていることを確認
    await expect(canvas.getByText('React')).toBeInTheDocument();
    await expect(canvas.getByText('TypeScript')).toBeInTheDocument();
    await expect(canvas.getByText('Next.js')).toBeInTheDocument();
  },
};

export const DisplaysDates: Story = {
  args: {
    slug: 'test-slug',
    tags: [],
    title: 'テスト記事',
    description: null,
    createdAt: new Date('2024/01/15'),
    updatedAt: new Date('2024/02/20'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 公開日と更新日が表示されていることを確認
    await expect(canvas.getByText('公開: 2024年1月15日')).toBeInTheDocument();
    await expect(canvas.getByText('更新: 2024年2月20日')).toBeInTheDocument();
  },
};

export const HasLinkToBlog: Story = {
  args: {
    slug: 'my-blog-post',
    tags: ['React'],
    title: 'ブログ記事リンクテスト',
    description: null,
    createdAt: new Date('2024/01/15'),
    updatedAt: new Date('2024/02/20'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // リンクが正しいhrefを持っていることを確認
    const link = canvas.getByRole('link');
    await expect(link).toHaveAttribute('href', '/blog/my-blog-post');
  },
};
