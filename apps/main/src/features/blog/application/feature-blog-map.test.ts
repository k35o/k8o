import { getBlogMetadata } from './blog';
import { getBlogs } from './blogs';
import { getFeatureBlogMap } from './feature-blog-map';

vi.mock('./blog', () => ({ getBlogMetadata: vi.fn() }));
vi.mock('./blogs', () => ({ getBlogs: vi.fn() }));

const blogRow = (id: number, slug: string) => ({ id, slug, tags: [] });

const metadata = (title: string, featureIds?: string[]) => ({
  title,
  description: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...(featureIds ? { featureIds } : {}),
});

describe('getFeatureBlogMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('正常系', () => {
    it('featureIdsを持つ記事からマップを構築する', async () => {
      vi.mocked(getBlogs).mockResolvedValue([
        blogRow(1, 'blog-a'),
        blogRow(2, 'blog-b'),
      ]);
      vi.mocked(getBlogMetadata)
        .mockResolvedValueOnce(metadata('記事A', ['feature-1', 'feature-2']))
        .mockResolvedValueOnce(metadata('記事B', ['feature-3']));

      const result = await getFeatureBlogMap();

      expect(result).toStrictEqual({
        'feature-1': { slug: 'blog-a', title: '記事A' },
        'feature-2': { slug: 'blog-a', title: '記事A' },
        'feature-3': { slug: 'blog-b', title: '記事B' },
      });
    });

    it('featureIdsが無い記事はマップに含めない', async () => {
      vi.mocked(getBlogs).mockResolvedValue([blogRow(1, 'blog-a')]);
      vi.mocked(getBlogMetadata).mockResolvedValue(metadata('記事A'));

      const result = await getFeatureBlogMap();

      expect(result).toStrictEqual({});
    });
  });

  describe('featureIdの重複', () => {
    it('getBlogsの並びで先頭（createdAt降順で最新）の記事を勝者にする', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.mocked(getBlogs).mockResolvedValue([
        blogRow(2, 'newest-blog'),
        blogRow(1, 'oldest-blog'),
      ]);
      vi.mocked(getBlogMetadata)
        .mockResolvedValueOnce(metadata('最新の記事', ['feature-1']))
        .mockResolvedValueOnce(metadata('古い記事', ['feature-1']));

      const result = await getFeatureBlogMap();

      expect(result).toStrictEqual({
        'feature-1': { slug: 'newest-blog', title: '最新の記事' },
      });
      warn.mockRestore();
    });

    it('メタデータの解決順に関係なく勝者が変わらない', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.mocked(getBlogs).mockResolvedValue([
        blogRow(2, 'newest-blog'),
        blogRow(1, 'oldest-blog'),
      ]);
      vi.mocked(getBlogMetadata)
        .mockImplementationOnce(async () => {
          await new Promise((resolve) => {
            setTimeout(resolve, 10);
          });
          return metadata('最新の記事', ['feature-1']);
        })
        .mockResolvedValueOnce(metadata('古い記事', ['feature-1']));

      const result = await getFeatureBlogMap();

      expect(result).toStrictEqual({
        'feature-1': { slug: 'newest-blog', title: '最新の記事' },
      });
      warn.mockRestore();
    });

    it('重複を検出したら警告を出す', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.mocked(getBlogs).mockResolvedValue([
        blogRow(2, 'newest-blog'),
        blogRow(1, 'oldest-blog'),
      ]);
      vi.mocked(getBlogMetadata)
        .mockResolvedValueOnce(metadata('最新の記事', ['feature-1']))
        .mockResolvedValueOnce(metadata('古い記事', ['feature-1']));

      await getFeatureBlogMap();

      expect(warn).toHaveBeenCalledWith(
        'featureId "feature-1" が複数の記事で指定されています: newest-blog, oldest-blog（newest-blog を使用）',
      );
      warn.mockRestore();
    });
  });
});
