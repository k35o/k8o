import { describe, expect, it, vi } from 'vitest';

import {
  findPublishedBlogRows,
  findPublishedBlogRowsByTags,
} from '../infrastructure/blog-repository';
import { findBlogMetadata } from './blog';
import { getBlogs, getBlogsByTags } from './blogs';

vi.mock('../infrastructure/blog-repository', () => ({
  findPublishedBlogRows: vi.fn(),
  findPublishedBlogRowsByTags: vi.fn(),
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

const taggedRow = (
  id: number,
  slug: string,
  tags: ReadonlyArray<{ id: number; name: string }>,
): BlogRow => ({
  id,
  slug,
  published: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  blogTag: tags.map((tag) => ({ blogId: id, tagId: tag.id, tag })),
});

const TYPESCRIPT = { id: 1, name: 'TypeScript' };
const REACT = { id: 2, name: 'React' };

describe('getBlogsByTags', () => {
  describe('正常系', () => {
    it('タグを共有する記事を、題・公開日・タグの名前つきで返す', async () => {
      vi.mocked(findPublishedBlogRowsByTags).mockResolvedValue([
        taggedRow(2, 'blog-b', [TYPESCRIPT, REACT]),
      ]);
      vi.mocked(findBlogMetadata).mockResolvedValue(metadata('タイトル'));

      const result = await getBlogsByTags('blog-a', [1, 2]);

      expect(findPublishedBlogRowsByTags).toHaveBeenCalledWith(
        'blog-a',
        [1, 2],
      );
      expect(result).toStrictEqual([
        {
          id: 2,
          slug: 'blog-b',
          title: 'タイトル',
          createdAt: '2026-01-01T00:00:00.000Z',
          tags: ['TypeScript', 'React'],
        },
      ]);
    });

    it('共有するタグの多い記事から並べる', async () => {
      vi.mocked(findPublishedBlogRowsByTags).mockResolvedValue([
        taggedRow(1, 'blog-one-tag', [TYPESCRIPT]),
        taggedRow(2, 'blog-two-tags', [TYPESCRIPT, REACT]),
      ]);
      vi.mocked(findBlogMetadata).mockResolvedValue(metadata('タイトル'));

      const result = await getBlogsByTags('current-blog', [1, 2]);

      expect(result.map((blog) => blog.slug)).toStrictEqual([
        'blog-two-tags',
        'blog-one-tag',
      ]);
    });

    it('最大6件を返す', async () => {
      vi.mocked(findPublishedBlogRowsByTags).mockResolvedValue(
        Array.from({ length: 10 }, (_, i) =>
          taggedRow(i + 1, `blog-${(i + 1).toString()}`, [TYPESCRIPT]),
        ),
      );
      vi.mocked(findBlogMetadata).mockResolvedValue(metadata('タイトル'));

      const result = await getBlogsByTags('current-blog', [1]);

      expect(result).toHaveLength(6);
    });
  });

  describe('異常系', () => {
    it('MDX が無い記事を外し、後ろの候補で6件を保つ', async () => {
      vi.mocked(findPublishedBlogRowsByTags).mockResolvedValue(
        Array.from({ length: 7 }, (_, i) =>
          taggedRow(i + 1, `blog-${(i + 1).toString()}`, [TYPESCRIPT]),
        ),
      );
      // 共有するタグの数が同じなので、DB の並びのまま blog-1 から読む
      vi.mocked(findBlogMetadata)
        .mockResolvedValueOnce(null)
        .mockResolvedValue(metadata('タイトル'));

      const result = await getBlogsByTags('current-blog', [1]);

      expect(result.map((blog) => blog.slug)).toStrictEqual([
        'blog-2',
        'blog-3',
        'blog-4',
        'blog-5',
        'blog-6',
        'blog-7',
      ]);
    });
  });

  describe('エッジケース', () => {
    it('タグを共有する記事が無ければ空の配列を返す', async () => {
      vi.mocked(findPublishedBlogRowsByTags).mockResolvedValue([]);

      const result = await getBlogsByTags('current-blog', [1]);

      expect(result).toStrictEqual([]);
    });
  });
});
