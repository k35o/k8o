import { filterBlogs } from './filter-blogs';
import type { BlogSummary } from './types';

const createBlog = (overrides: Partial<BlogSummary>): BlogSummary => ({
  id: 1,
  slug: 'slug',
  tags: [],
  title: 'タイトル',
  description: '説明',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const blogs: BlogSummary[] = [
  createBlog({
    id: 1,
    slug: 'react-hooks',
    title: 'React Hooks 入門',
    description: 'useState と useEffect を学ぶ',
    tags: ['React', 'TypeScript'],
  }),
  createBlog({
    id: 2,
    slug: 'css-grid',
    title: 'CSS Grid レイアウト',
    description: null,
    tags: ['CSS'],
  }),
  createBlog({
    id: 3,
    slug: 'next-cache',
    title: 'Next.js のキャッシュ',
    description: 'use cache を理解する',
    tags: ['React', 'Next.js'],
  }),
];

describe('filterBlogs', () => {
  describe('正常系', () => {
    it('クエリが空のときは全件を返すべき', () => {
      const result = filterBlogs(blogs, '');
      expect(result).toHaveLength(3);
    });

    it('タイトルに部分一致するクエリで絞り込めるべき（大文字小文字を無視）', () => {
      const result = filterBlogs(blogs, 'grid');
      expect(result.map((b) => b.id)).toEqual([2]);
    });

    it('タイトル・タグのいずれかに一致する全件を返すべき', () => {
      // id1 はタイトルとタグ、id3 はタグ "React" に一致する
      const result = filterBlogs(blogs, 'react');
      expect(result.map((b) => b.id)).toEqual([1, 3]);
    });

    it('description に一致するクエリで絞り込めるべき', () => {
      const result = filterBlogs(blogs, 'usestate');
      expect(result.map((b) => b.id)).toEqual([1]);
    });

    it('タグ名へのクエリで絞り込めるべき', () => {
      const result = filterBlogs(blogs, 'typescript');
      expect(result.map((b) => b.id)).toEqual([1]);
    });
  });

  describe('エッジケース', () => {
    it('description が null の記事でもエラーにならず除外判定されるべき', () => {
      const result = filterBlogs(blogs, 'grid');
      expect(result.map((b) => b.id)).toEqual([2]);
    });

    it('全角英数のクエリを正規化してヒットさせるべき（Ｒｅａｃｔ → React）', () => {
      // 半角 "react" と同じく id1（タイトル・タグ）と id3（タグ）にヒットする
      const result = filterBlogs(blogs, 'Ｒｅａｃｔ');
      expect(result.map((b) => b.id)).toEqual([1, 3]);
    });

    it('複数トークンは AND で評価し、全角スペース区切りも吸収するべき', () => {
      const result = filterBlogs(blogs, 'react　hooks');
      expect(result.map((b) => b.id)).toEqual([1]);
    });

    it('空白のみのクエリは条件なしとして扱うべき', () => {
      const result = filterBlogs(blogs, '   ');
      expect(result).toHaveLength(3);
    });

    it('一致しない条件では 0 件を返すべき', () => {
      const result = filterBlogs(blogs, '存在しない');
      expect(result).toHaveLength(0);
    });
  });

  describe('非破壊・順序保持', () => {
    it('入力配列を破壊せず、結果は入力順を保持するべき', () => {
      const input = [...blogs];
      const result = filterBlogs(input, 'react');
      expect(input).toEqual(blogs);
      expect(result.map((b) => b.id)).toEqual([1, 3]);
    });
  });
});
