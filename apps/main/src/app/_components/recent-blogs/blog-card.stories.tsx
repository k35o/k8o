import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { BlogCard } from './blog-card';

const meta: Meta<typeof BlogCard> = {
  title: 'app/globals/recent-blogs/blog-card',
  component: BlogCard,
};

export default meta;
type Story = StoryObj<typeof BlogCard>;

export const Primary: Story = {
  args: {
    slug: 'example-post',
    title: 'サンプル記事のタイトル',
    description:
      'これはサンプル記事の説明文です。記事の概要を簡潔に説明します。',
    tags: ['React', 'TypeScript'],
    createdAt: new Date('2024/01/15'),
  },
};

export const DisplaysTitle: Story = {
  args: {
    slug: 'test-slug',
    title: 'テスト記事のタイトル',
    description: 'テスト説明文',
    tags: ['React'],
    createdAt: new Date('2024/01/15'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: 'テスト記事のタイトル' }),
    ).toBeInTheDocument();
  },
};

export const DisplaysTags: Story = {
  args: {
    slug: 'test-slug',
    title: 'テスト記事',
    description: null,
    tags: ['React', 'TypeScript', 'Next.js'],
    createdAt: new Date('2024/01/15'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('React')).toBeInTheDocument();
    await expect(canvas.getByText('TypeScript')).toBeInTheDocument();
    await expect(canvas.getByText('Next.js')).toBeInTheDocument();
  },
};

export const DisplaysDate: Story = {
  args: {
    slug: 'test-slug',
    title: 'テスト記事',
    description: null,
    tags: [],
    createdAt: new Date('2024/01/15'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('2024年1月15日')).toBeInTheDocument();
  },
};

export const HasLinkToBlog: Story = {
  args: {
    slug: 'my-blog-post',
    title: 'ブログ記事リンクテスト',
    description: null,
    tags: ['React'],
    createdAt: new Date('2024/01/15'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = canvas.getByRole('link');
    await expect(link).toHaveAttribute('href', '/blog/my-blog-post');
  },
};

export const WithoutDescription: Story = {
  args: {
    slug: 'no-description',
    title: '説明なしの記事',
    description: null,
    tags: ['TypeScript'],
    createdAt: new Date('2024/02/20'),
  },
};

export const WithoutTags: Story = {
  args: {
    slug: 'no-tags',
    title: 'タグなしの記事',
    description: '説明文あり',
    tags: [],
    createdAt: new Date('2024/02/20'),
  },
};
