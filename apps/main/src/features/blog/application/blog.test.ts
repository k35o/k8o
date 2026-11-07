import { readFile } from 'node:fs/promises';

import { findFrontmatter } from '@repo/helpers/mdx/frontmatter';
import { describe, expect, it, vi } from 'vitest';

import { getTocTree } from '@/shared/mdx/toc-tree';

import { findPublishedBlogRow } from '../infrastructure/blog-repository';
import { findBlog, findBlogMetadata, getBlogToc } from './blog';
import { blogPath } from './path';

vi.mock('../infrastructure/blog-repository', () => ({
  findPublishedBlogRow: vi.fn(),
}));
vi.mock('node:fs/promises');
vi.mock('@repo/helpers/mdx/frontmatter');
vi.mock('@/shared/mdx/toc-tree');
vi.mock('./path');

type BlogRow = NonNullable<Awaited<ReturnType<typeof findPublishedBlogRow>>>;

const blogRow = (overrides: Partial<BlogRow> = {}): BlogRow => ({
  id: 1,
  slug: 'test-slug',
  published: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  blogTag: [],
  talks: [],
  ...overrides,
});

describe('findBlog', () => {
  describe('正常系', () => {
    it('ブログの詳細情報を、タグと発表のスライドの URL つきで返す', async () => {
      vi.mocked(findPublishedBlogRow).mockResolvedValue(
        blogRow({
          blogTag: [
            { blogId: 1, tagId: 1, tag: { id: 1, name: 'TypeScript' } },
            { blogId: 1, tagId: 2, tag: { id: 2, name: 'React' } },
          ],
          talks: [
            {
              id: 1,
              title: '発表',
              eventUrl: 'https://example.com/event',
              eventName: 'イベント',
              eventDate: '2026-01-01',
              eventLocation: null,
              slideUrl: 'https://example.com/slide.pdf',
              blogId: 1,
            },
          ],
        }),
      );

      const result = await findBlog('test-slug');

      expect(result).toStrictEqual({
        id: 1,
        slug: 'test-slug',
        tags: [
          { id: 1, name: 'TypeScript' },
          { id: 2, name: 'React' },
        ],
        slideUrl: 'https://example.com/slide.pdf',
      });
    });
  });

  describe('異常系', () => {
    it('存在しない、または未公開の slug の場合は null を返す', async () => {
      vi.mocked(findPublishedBlogRow).mockResolvedValue(undefined);

      const result = await findBlog('non-existent-slug');

      expect(result).toBeNull();
    });
  });

  describe('エッジケース', () => {
    it('発表が無い記事のスライドの URL は undefined にする', async () => {
      vi.mocked(findPublishedBlogRow).mockResolvedValue(blogRow());

      const result = await findBlog('test-slug');

      expect(result?.slideUrl).toBeUndefined();
    });
  });
});

describe('findBlogMetadata', () => {
  describe('正常系', () => {
    it('MDXファイルが存在する場合はメタデータを返す', async () => {
      const mockMetadata = {
        title: 'Test Blog',
        description: 'Test Description',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      vi.mocked(blogPath).mockReturnValue('/path/to/blog');
      vi.mocked(findFrontmatter).mockResolvedValue(mockMetadata);

      const result = await findBlogMetadata('test-slug');

      expect(result).toBe(mockMetadata);
    });
  });

  describe('異常系', () => {
    it('MDXファイルが存在しない場合はnullを返し警告を出す', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.mocked(blogPath).mockReturnValue('/path/to/blog');
      vi.mocked(findFrontmatter).mockResolvedValue(null);

      const result = await findBlogMetadata('missing-slug');

      expect(result).toBeNull();
      expect(warn).toHaveBeenCalledWith(
        'ブログ "missing-slug" のMDXファイルが存在しないため、記事が無いものとして扱います',
      );
      warn.mockRestore();
    });

    it('ファイル欠損以外のエラーはそのまま投げる', async () => {
      vi.mocked(blogPath).mockReturnValue('/path/to/blog');
      vi.mocked(findFrontmatter).mockRejectedValue(
        new Error('Invalid frontmatter in /path/to/blog'),
      );

      await expect(findBlogMetadata('broken-slug')).rejects.toThrow(
        'Invalid frontmatter',
      );
    });
  });
});

describe('getBlogToc', () => {
  describe('正常系', () => {
    it('記事の MDX を読み、見出しの木を返す', async () => {
      const toc = {
        depth: 0 as const,
        children: [
          {
            depth: 1 as const,
            text: 'Introduction',
            children: [
              {
                depth: 2 as const,
                text: 'Getting Started',
                children: [],
              },
            ],
          },
        ],
      };
      vi.mocked(blogPath).mockReturnValue('/path/to/blog');
      vi.mocked(readFile).mockResolvedValue('## Introduction');
      vi.mocked(getTocTree).mockResolvedValue(toc);

      const result = await getBlogToc('test-slug');

      expect(blogPath).toHaveBeenCalledWith('test-slug');
      expect(readFile).toHaveBeenCalledWith('/path/to/blog', 'utf-8');
      expect(getTocTree).toHaveBeenCalledWith('## Introduction');
      expect(result).toBe(toc);
    });
  });
});
