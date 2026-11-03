import { expect, within } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { BlogCard } from './blog-card';

const meta = preview.meta({
  title: 'app/globals/recent-blogs/blog-card',
  component: BlogCard,
});

export const Primary = meta.story({
  args: {
    slug: 'example-post',
    title: 'サンプル記事のタイトル',
    description:
      'これはサンプル記事の説明文です。記事の概要を簡潔に説明します。',
    tags: ['React', 'TypeScript'],
    createdAt: '2024-01-15T00:00:00.000Z',
  },
});

export const DisplaysTitle = meta.story({
  args: {
    slug: 'test-slug',
    title: 'テスト記事のタイトル',
    description: 'テスト説明文',
    tags: ['React'],
    createdAt: '2024-01-15T00:00:00.000Z',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: 'テスト記事のタイトル' }),
    ).toBeInTheDocument();
  },
});

export const DisplaysTags = meta.story({
  args: {
    slug: 'test-slug',
    title: 'テスト記事',
    description: null,
    tags: ['React', 'TypeScript', 'Next.js'],
    createdAt: '2024-01-15T00:00:00.000Z',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('React')).toBeInTheDocument();
    await expect(canvas.getByText('TypeScript')).toBeInTheDocument();
    await expect(canvas.getByText('Next.js')).toBeInTheDocument();
  },
});

export const DisplaysDate = meta.story({
  args: {
    slug: 'test-slug',
    title: 'テスト記事',
    description: null,
    tags: [],
    createdAt: '2024-01-15T00:00:00.000Z',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('2024年1月15日')).toBeInTheDocument();
  },
});

export const HasLinkToBlog = meta.story({
  args: {
    slug: 'my-blog-post',
    title: 'ブログ記事リンクテスト',
    description: null,
    tags: ['React'],
    createdAt: '2024-01-15T00:00:00.000Z',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = canvas.getByRole('link');
    await expect(link).toHaveAttribute('href', '/blog/my-blog-post');
  },
});

export const WithoutDescription = meta.story({
  args: {
    slug: 'no-description',
    title: '説明なしの記事',
    description: null,
    tags: ['TypeScript'],
    createdAt: '2024-02-20T00:00:00.000Z',
  },
});

export const WithoutTags = meta.story({
  args: {
    slug: 'no-tags',
    title: 'タグなしの記事',
    description: '説明文あり',
    tags: [],
    createdAt: '2024-02-20T00:00:00.000Z',
  },
});
