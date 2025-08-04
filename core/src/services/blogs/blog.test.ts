import { getFrontmatter, getTocTree } from '@k8o/helpers/mdx';
import { db } from '@/database/db';
import { getBlog, getBlogMetadata, getBlogToc } from './blog';
import { blogPath } from './path';

vi.mock('@/database/db', () => ({
  db: {
    query: {
      blogs: {
        findFirst: vi.fn(),
      },
    },
  },
}));
vi.mock('@k8o/helpers/mdx');
vi.mock('./path');

describe('blog service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBlog', () => {
    it('ブログの詳細情報を取得できる', async () => {
      const mockBlog = {
        id: 1,
        slug: 'test-slug',
        published: true,
        createdAt: new Date(),
        blogTag: [
          {
            tag: {
              id: 1,
              name: 'TypeScript',
            },
          },
          {
            tag: {
              id: 2,
              name: 'React',
            },
          },
        ],
        talks: [
          {
            slideUrl: 'https://example.com/slide.pdf',
          },
        ],
      };

      vi.mocked(db.query.blogs.findFirst).mockResolvedValue(mockBlog);

      const result = await getBlog('test-slug');

      expect(result).toEqual({
        id: 1,
        slug: 'test-slug',
        tags: [
          {
            id: 1,
            name: 'TypeScript',
          },
          {
            id: 2,
            name: 'React',
          },
        ],
        slideUrl: 'https://example.com/slide.pdf',
      });
    });

    it('スライドURLがない場合はundefinedを返す', async () => {
      const mockBlog = {
        id: 1,
        slug: 'test-slug',
        published: true,
        createdAt: new Date(),
        blogTag: [],
        talks: [],
      };

      vi.mocked(db.query.blogs.findFirst).mockResolvedValue(mockBlog);

      const result = await getBlog('test-slug');

      expect(result.slideUrl).toBeUndefined();
    });

    it('存在しないスラッグの場合はエラーを投げる', async () => {
      vi.mocked(db.query.blogs.findFirst).mockResolvedValue(undefined);

      await expect(getBlog('non-existent-slug')).rejects.toThrow(
        'Blog not found: non-existent-slug',
      );
    });
  });

  describe('getBlogMetadata', () => {
    it('ブログのメタデータを取得できる', async () => {
      const mockMetadata = {
        title: 'Test Blog',
        description: 'Test Description',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      };

      vi.mocked(blogPath).mockReturnValue('/path/to/blog');
      vi.mocked(getFrontmatter).mockResolvedValue(mockMetadata);

      const result = await getBlogMetadata('test-slug');

      expect(blogPath).toHaveBeenCalledWith('test-slug');
      expect(getFrontmatter).toHaveBeenCalledWith('/path/to/blog');
      expect(result).toBe(mockMetadata);
    });
  });

  describe('getBlogToc', () => {
    it('ブログの目次を取得できる', async () => {
      const mockToc = {
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
      vi.mocked(getTocTree).mockResolvedValue(mockToc);

      const result = await getBlogToc('test-slug');

      expect(blogPath).toHaveBeenCalledWith('test-slug');
      expect(getTocTree).toHaveBeenCalledWith('/path/to/blog');
      expect(result).toBe(mockToc);
    });
  });
});
