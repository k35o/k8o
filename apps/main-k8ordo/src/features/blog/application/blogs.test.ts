import { describe, expect, it, vi } from 'vitest';

import { findPublishedBlogRows } from '../infrastructure/blog-repository';
import { findBlogMetadata } from './blog';
import { getBlogs } from './blogs';

vi.mock('../infrastructure/blog-repository', () => ({
  findPublishedBlogRows: vi.fn(),
}));
vi.mock('./blog');

type BlogRow = Awaited<ReturnType<typeof findPublishedBlogRows>>[number];

const row = (id: number, slug: string, tagNames: string[]): BlogRow => ({
  id,
  slug,
  published: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  blogTag: tagNames.map((name, index) => ({
    blogId: id,
    tagId: index + 1,
    tag: { id: index + 1, name },
  })),
});

const metadata = (title: string) => ({
  title,
  description: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('getBlogs', () => {
  describe('正常系', () => {
    it('公開された記事を、タグの名前と MDX のメタデータつきで一覧の並びのまま返す', async () => {
      vi.mocked(findPublishedBlogRows).mockResolvedValue([
        row(2, 'blog-b', ['TypeScript', 'React']),
        row(1, 'blog-a', ['Next.js']),
      ]);
      vi.mocked(findBlogMetadata).mockImplementation((slug) =>
        Promise.resolve(metadata(`タイトル: ${slug}`)),
      );

      const result = await getBlogs();

      expect(result).toStrictEqual([
        {
          id: 2,
          slug: 'blog-b',
          tags: ['TypeScript', 'React'],
          title: 'タイトル: blog-b',
          description: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 1,
          slug: 'blog-a',
          tags: ['Next.js'],
          title: 'タイトル: blog-a',
          description: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ]);
    });
  });

  describe('異常系', () => {
    it('DB では公開済みでも MDX が無い記事は挙げない', async () => {
      vi.mocked(findPublishedBlogRows).mockResolvedValue([
        row(1, 'blog-a', []),
        row(2, 'missing-blog', []),
      ]);
      vi.mocked(findBlogMetadata).mockImplementation((slug) =>
        Promise.resolve(slug === 'missing-blog' ? null : metadata('記事A')),
      );

      const result = await getBlogs();

      expect(result.map((blog) => blog.slug)).toStrictEqual(['blog-a']);
    });
  });

  describe('エッジケース', () => {
    it('公開された記事が無ければ空の配列を返す', async () => {
      vi.mocked(findPublishedBlogRows).mockResolvedValue([]);

      const result = await getBlogs();

      expect(result).toStrictEqual([]);
    });
  });
});
