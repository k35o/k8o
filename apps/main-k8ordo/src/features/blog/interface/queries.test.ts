import { isNotFound } from '@k8ordo/framework';
import { describe, expect, it, vi } from 'vitest';

import { findBlog, findBlogMetadata } from '@/features/blog/application/blog';
import { getBlogs } from '@/features/blog/application/blogs';

import { getMarkdown } from './markdown';
import {
  findBlogContent,
  findBlogMarkdown,
  getBlogContent,
  getBlogContents,
  isPublishedBlog,
} from './queries';

vi.mock('@/features/blog/application/blog', () => ({
  findBlog: vi.fn(),
  findBlogMetadata: vi.fn(),
}));
vi.mock('@/features/blog/application/blogs', () => ({
  getBlogs: vi.fn(),
}));
vi.mock('@/features/blog/application/og-code', () => ({
  getBlogOgCode: vi.fn(),
}));
vi.mock('./markdown', () => ({
  getMarkdown: vi.fn(),
}));

const metadata = (title: string) => ({
  title,
  description: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('getBlogContents', () => {
  describe('正常系', () => {
    it('記事の一覧に読了時間を足して返す', async () => {
      vi.mocked(getBlogs).mockResolvedValue([
        { id: 1, slug: 'blog-a', tags: ['TypeScript'], ...metadata('記事A') },
        { id: 2, slug: 'blog-b', tags: [], ...metadata('記事B') },
      ]);
      vi.mocked(getMarkdown).mockResolvedValue('本文');

      const result = await getBlogContents();

      expect(result).toStrictEqual([
        {
          id: 1,
          slug: 'blog-a',
          tags: ['TypeScript'],
          title: '記事A',
          description: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          readingTime: 1,
        },
        {
          id: 2,
          slug: 'blog-b',
          tags: [],
          title: '記事B',
          description: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          readingTime: 1,
        },
      ]);
    });
  });
});

describe('getBlogContent', () => {
  describe('異常系', () => {
    it('DB では公開済みでも MDX が無い記事は notFound() で 404 にする', async () => {
      vi.mocked(findBlog).mockResolvedValue({
        id: 1,
        slug: 'missing-blog',
        tags: [],
        slideUrl: undefined,
      });
      vi.mocked(findBlogMetadata).mockResolvedValue(null);

      await expect(getBlogContent('missing-blog')).rejects.toSatisfy(
        isNotFound,
      );
    });
  });
});

describe('findBlogContent', () => {
  describe('正常系', () => {
    it('公開済みの記事はメタデータと合わせて返す', async () => {
      vi.mocked(findBlog).mockResolvedValue({
        id: 1,
        slug: 'blog-a',
        tags: [{ id: 1, name: 'CSS' }],
        slideUrl: undefined,
      });
      vi.mocked(findBlogMetadata).mockResolvedValue(metadata('タイトル'));

      const result = await findBlogContent('blog-a');

      expect(result).toStrictEqual({
        id: 1,
        slug: 'blog-a',
        tags: [{ id: 1, name: 'CSS' }],
        slideUrl: undefined,
        title: 'タイトル',
        description: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
    });
  });

  describe('異常系', () => {
    it('未公開または存在しない記事は null を返し、MDXは読まない', async () => {
      vi.mocked(findBlog).mockResolvedValue(null);

      const result = await findBlogContent('draft-blog');

      expect(result).toBeNull();
      expect(findBlogMetadata).not.toHaveBeenCalled();
    });

    it('DB では公開済みでも MDX が無い記事は null を返す', async () => {
      vi.mocked(findBlog).mockResolvedValue({
        id: 1,
        slug: 'missing-blog',
        tags: [],
        slideUrl: undefined,
      });
      vi.mocked(findBlogMetadata).mockResolvedValue(null);

      await expect(findBlogContent('missing-blog')).resolves.toBeNull();
    });
  });
});

describe('getBlogContent の 404', () => {
  it('未公開または存在しない記事は notFound() で 404 にする', async () => {
    vi.mocked(findBlog).mockResolvedValue(null);

    await expect(getBlogContent('draft-blog')).rejects.toSatisfy(isNotFound);
  });
});

describe('isPublishedBlog', () => {
  describe('正常系', () => {
    it('公開済みの記事なら true を返す', async () => {
      vi.mocked(findBlog).mockResolvedValue({
        id: 1,
        slug: 'blog-a',
        tags: [],
        slideUrl: undefined,
      });

      await expect(isPublishedBlog('blog-a')).resolves.toBe(true);
    });
  });

  describe('異常系', () => {
    it('下書きまたは存在しない記事なら false を返す', async () => {
      vi.mocked(findBlog).mockResolvedValue(null);

      await expect(isPublishedBlog('draft-blog')).resolves.toBe(false);
    });

    it('DB を読めないときは false にせず失敗させる', async () => {
      vi.mocked(findBlog).mockRejectedValue(new Error('DB に繋がらない'));

      await expect(isPublishedBlog('blog-a')).rejects.toThrow(
        'DB に繋がらない',
      );
    });
  });
});

describe('findBlogMarkdown', () => {
  describe('正常系', () => {
    it('MDX がある記事は markdown を返す', async () => {
      vi.mocked(findBlogMetadata).mockResolvedValue(metadata('タイトル'));
      vi.mocked(getMarkdown).mockResolvedValue('# タイトル\n\n本文');

      await expect(findBlogMarkdown('blog-a')).resolves.toBe(
        '# タイトル\n\n本文',
      );
    });
  });

  describe('異常系', () => {
    it('MDX が無い記事は null を返し、本文を読まない', async () => {
      vi.mocked(findBlogMetadata).mockResolvedValue(null);

      const result = await findBlogMarkdown('missing-blog');

      expect(result).toBeNull();
      expect(getMarkdown).not.toHaveBeenCalledWith('missing-blog');
    });
  });
});
