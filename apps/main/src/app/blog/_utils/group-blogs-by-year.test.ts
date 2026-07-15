import { groupBlogsByYear } from './group-blogs-by-year';
import type { BlogSummary } from './types';

const createBlog = (id: number, createdAt: string): BlogSummary => ({
  id,
  slug: `slug-${id}`,
  tags: [],
  title: `タイトル${id}`,
  description: null,
  createdAt,
  updatedAt: createdAt,
});

describe('groupBlogsByYear', () => {
  describe('正常系', () => {
    it('複数年を降順でグルーピングするべき', () => {
      const blogs: BlogSummary[] = [
        createBlog(1, '2025-03-01T00:00:00.000Z'),
        createBlog(2, '2024-06-01T00:00:00.000Z'),
        createBlog(3, '2023-12-01T00:00:00.000Z'),
      ];
      const result = groupBlogsByYear(blogs);
      expect(result.map((g) => g.year)).toStrictEqual([2025, 2024, 2023]);
    });

    it('同一年のグループ内では入力順を保持するべき', () => {
      const blogs: BlogSummary[] = [
        createBlog(1, '2024-12-01T00:00:00.000Z'),
        createBlog(2, '2024-06-01T00:00:00.000Z'),
        createBlog(3, '2024-01-01T00:00:00.000Z'),
      ];
      const result = groupBlogsByYear(blogs);
      expect(result).toHaveLength(1);
      expect(result[0]?.blogs.map((b) => b.id)).toStrictEqual([1, 2, 3]);
    });
  });

  describe('エッジケース', () => {
    it('空配列のときは空配列を返すべき', () => {
      expect(groupBlogsByYear([])).toStrictEqual([]);
    });

    it('単一年のみのときは 1 グループを返すべき', () => {
      const blogs: BlogSummary[] = [
        createBlog(1, '2024-05-01T00:00:00.000Z'),
        createBlog(2, '2024-09-01T00:00:00.000Z'),
      ];
      const result = groupBlogsByYear(blogs);
      expect(result).toHaveLength(1);
      expect(result[0]?.year).toBe(2024);
    });

    it('年境界をまたぐ記事を別グループに分けるべき（TZ=UTC 前提）', () => {
      const blogs: BlogSummary[] = [
        createBlog(1, '2025-01-01T00:00:00.000Z'),
        createBlog(2, '2024-12-31T00:00:00.000Z'),
      ];
      const result = groupBlogsByYear(blogs);
      expect(result.map((g) => g.year)).toStrictEqual([2025, 2024]);
      expect(result[0]?.blogs.map((b) => b.id)).toStrictEqual([1]);
      expect(result[1]?.blogs.map((b) => b.id)).toStrictEqual([2]);
    });
  });
});
