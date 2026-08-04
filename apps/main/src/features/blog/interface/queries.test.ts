import {
  findBlogMetadata,
  getBlog,
  getBlogMetadata,
} from '@/features/blog/application/blog';
import { getBlogs } from '@/features/blog/application/blogs';

import { getMarkdown } from './markdown';
import { getBlogContent, getBlogContents } from './queries';

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));
vi.mock('@/features/blog/application/blog', () => ({
  findBlogMetadata: vi.fn(),
  findPublishedBlogId: vi.fn(),
  getBlog: vi.fn(),
  getBlogMetadata: vi.fn(),
  getBlogToc: vi.fn(),
}));
vi.mock('@/features/blog/application/blogs', () => ({
  getBlogs: vi.fn(),
  getBlogsByTags: vi.fn(),
}));
vi.mock('@/features/blog/application/feature-blog-map', () => ({
  getFeatureBlogMap: vi.fn(),
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('正常系', () => {
    it('ブログ一覧をメタデータ・読了時間つきで返す', async () => {
      vi.mocked(getBlogs).mockResolvedValue([
        { id: 1, slug: 'blog-a', tags: ['TypeScript'] },
        { id: 2, slug: 'blog-b', tags: [] },
      ]);
      vi.mocked(findBlogMetadata).mockImplementation((slug) =>
        Promise.resolve(metadata(`タイトル: ${slug}`)),
      );
      vi.mocked(getMarkdown).mockResolvedValue('本文');

      const result = await getBlogContents();

      expect(result).toStrictEqual([
        {
          id: 1,
          slug: 'blog-a',
          tags: ['TypeScript'],
          title: 'タイトル: blog-a',
          description: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          readingTime: 1,
        },
        {
          id: 2,
          slug: 'blog-b',
          tags: [],
          title: 'タイトル: blog-b',
          description: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          readingTime: 1,
        },
      ]);
    });
  });

  describe('異常系', () => {
    it('MDXファイルが無いブログは一覧から除外される', async () => {
      vi.mocked(getBlogs).mockResolvedValue([
        { id: 1, slug: 'blog-a', tags: [] },
        { id: 2, slug: 'missing-blog', tags: [] },
      ]);
      // getBlogsの並び順どおりに呼ばれる: blog-a → missing-blog
      vi.mocked(findBlogMetadata)
        .mockResolvedValueOnce(metadata('記事A'))
        .mockResolvedValueOnce(null);
      vi.mocked(getMarkdown).mockResolvedValue('本文');

      const result = await getBlogContents();

      expect(result).toHaveLength(1);
      expect(result[0]?.slug).toBe('blog-a');
      // 欠損slugでは読了時間算出のためのMDX読み込みも行わない
      expect(getMarkdown).not.toHaveBeenCalledWith('missing-blog');
    });
  });
});

describe('getBlogContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('異常系', () => {
    it('MDXファイルが無い場合は例外を投げる（詳細ページは一覧と違いエラーにする）', async () => {
      vi.mocked(getBlog).mockResolvedValue({
        id: 1,
        slug: 'missing-blog',
        tags: [],
        slideUrl: undefined,
      });
      vi.mocked(getBlogMetadata).mockRejectedValue(
        Object.assign(new Error('ENOENT: no such file or directory'), {
          code: 'ENOENT',
        }),
      );

      await expect(getBlogContent('missing-blog')).rejects.toThrow('ENOENT');
    });
  });
});
