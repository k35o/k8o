import { getFrontmatter } from '@repo/helpers/mdx/frontmatter';
import { db } from '@/database/db';
import { getBlogs, getBlogsByTags } from './blogs';
import { blogPath } from './path';

vi.mock('@/database/db', () => ({
  db: {
    query: {
      blogs: {
        findMany: vi.fn(),
      },
      blogTag: {
        findMany: vi.fn(),
      },
    },
  },
}));
vi.mock('@k8o/helpers/mdx/frontmatter');
vi.mock('./path');

describe('blogs service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBlogs', () => {
    it('公開されたブログの一覧を取得できる', async () => {
      const mockBlogs = [
        {
          id: 1,
          slug: 'blog-1',
          published: true,
          createdAt: new Date(),
          blogTag: [
            {
              tag: {
                name: 'TypeScript',
              },
            },
            {
              tag: {
                name: 'React',
              },
            },
          ],
        },
        {
          id: 2,
          slug: 'blog-2',
          published: true,
          createdAt: new Date(),
          blogTag: [
            {
              tag: {
                name: 'Next.js',
              },
            },
          ],
        },
      ];

      vi.mocked(db.query.blogs.findMany).mockResolvedValue(mockBlogs);

      const result = await getBlogs();

      expect(result).toEqual([
        {
          id: 1,
          slug: 'blog-1',
          tags: ['TypeScript', 'React'],
        },
        {
          id: 2,
          slug: 'blog-2',
          tags: ['Next.js'],
        },
      ]);
    });

    it('空の配列が返された場合は空の配列を返す', async () => {
      vi.mocked(db.query.blogs.findMany).mockResolvedValue([]);

      const result = await getBlogs();

      expect(result).toEqual([]);
    });
  });

  describe('getBlogsByTags', () => {
    it('指定されたタグを持つブログを取得できる', async () => {
      const mockBlogTags = [
        { tagId: 1, blogId: 1 },
        { tagId: 1, blogId: 2 },
        { tagId: 2, blogId: 3 },
      ];

      const mockBlogs = [
        {
          id: 2,
          slug: 'blog-2',
          published: true,
          createdAt: new Date('2023-01-02'),
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
        },
        {
          id: 3,
          slug: 'blog-3',
          published: true,
          createdAt: new Date('2023-01-03'),
          blogTag: [
            {
              tag: {
                id: 1,
                name: 'TypeScript',
              },
            },
          ],
        },
      ];

      const mockMetadata = {
        title: 'Test Blog',
        description: 'Test Description',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      };

      vi.mocked(db.query.blogTag.findMany).mockResolvedValue(mockBlogTags);
      vi.mocked(db.query.blogs.findMany).mockResolvedValue(mockBlogs);
      vi.mocked(blogPath).mockReturnValue('/path/to/blog');
      vi.mocked(getFrontmatter).mockResolvedValue(mockMetadata);

      const result = await getBlogsByTags('blog-1', [1, 2]);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 2,
        slug: 'blog-2',
        title: 'Test Blog',
        createdAt: new Date('2023-01-01'),
        tags: ['TypeScript', 'React'],
      });
    });

    it('タグマッチ数でソートされる', async () => {
      const mockBlogTags = [
        { tagId: 1, blogId: 1 },
        { tagId: 1, blogId: 2 },
      ];

      const mockBlogs = [
        {
          id: 1,
          slug: 'blog-1',
          published: true,
          createdAt: new Date('2023-01-01'),
          blogTag: [
            {
              tag: {
                id: 1,
                name: 'TypeScript',
              },
            },
          ],
        },
        {
          id: 2,
          slug: 'blog-2',
          published: true,
          createdAt: new Date('2023-01-02'),
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
        },
      ];

      const mockMetadata = {
        title: 'Test Blog',
        description: 'Test Description',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      };

      vi.mocked(db.query.blogTag.findMany).mockResolvedValue(mockBlogTags);
      vi.mocked(db.query.blogs.findMany).mockResolvedValue(mockBlogs);
      vi.mocked(blogPath).mockReturnValue('/path/to/blog');
      vi.mocked(getFrontmatter).mockResolvedValue(mockMetadata);

      const result = await getBlogsByTags('current-blog', [1, 2]);

      // blog-2が先に来る（2つのタグがマッチ）
      expect(result[0]?.id).toBe(2);
      expect(result[1]?.id).toBe(1);
    });

    it('最大6件のブログを返す', async () => {
      const mockBlogTags = Array.from({ length: 10 }, (_, i) => ({
        tagId: 1,
        blogId: i + 1,
      }));
      const mockBlogs = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        slug: `blog-${(i + 1).toString()}`,
        published: true,
        createdAt: new Date(`2023-01-${String(i + 1).padStart(2, '0')}`),
        blogTag: [
          {
            tag: {
              id: 1,
              name: 'TypeScript',
            },
          },
        ],
      }));

      const mockMetadata = {
        title: 'Test Blog',
        description: 'Test Description',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      };

      vi.mocked(db.query.blogTag.findMany).mockResolvedValue(mockBlogTags);
      vi.mocked(db.query.blogs.findMany).mockResolvedValue(mockBlogs);
      vi.mocked(blogPath).mockReturnValue('/path/to/blog');
      vi.mocked(getFrontmatter).mockResolvedValue(mockMetadata);

      const result = await getBlogsByTags('current-blog', [1]);

      expect(result).toHaveLength(6);
    });

    it('該当するブログがない場合は空の配列を返す', async () => {
      vi.mocked(db.query.blogTag.findMany).mockResolvedValue([]);
      vi.mocked(db.query.blogs.findMany).mockResolvedValue([]);

      const result = await getBlogsByTags('current-blog', [1]);

      expect(result).toEqual([]);
    });
  });
});
