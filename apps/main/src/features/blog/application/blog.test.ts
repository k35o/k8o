import { readFile } from 'node:fs/promises';

import { findFrontmatter } from '@repo/helpers/mdx/frontmatter';
import { describe, expect, it, vi } from 'vitest';

import { findBlogMetadata, getBlogToc } from './blog';
import { blogPath } from './path';
import { getTocTree } from './toc-tree';

vi.mock('node:fs/promises');
vi.mock('@repo/helpers/mdx/frontmatter');
vi.mock('./toc-tree');
vi.mock('./path');

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
