import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getBlogContents } from '@/features/blog/interface/queries';
import { getTag, getTags } from '@/features/tags/interface/queries';

import { getTagContent, getTagSummaries } from './tag-contents';

vi.mock('@/features/blog/interface/queries', () => ({
  getBlogContents: vi.fn(),
}));
vi.mock('@/features/tags/interface/queries', () => ({
  getTag: vi.fn(),
  getTags: vi.fn(),
}));

type BlogContent = Awaited<ReturnType<typeof getBlogContents>>[number];

const blog = (id: number, title: string): BlogContent => ({
  id,
  slug: `blog-${id.toString()}`,
  tags: ['CSS'],
  title,
  description: null,
  createdAt: '2026-01-05',
  updatedAt: '2026-01-06',
  readingTime: 3,
});

describe('getTagSummaries', () => {
  beforeEach(() => {
    vi.mocked(getBlogContents).mockResolvedValue([
      blog(1, '記事1'),
      blog(2, '記事2'),
    ]);
  });

  describe('正常系', () => {
    it('タグごとに、MDXのある公開済みの記事の数とトークの数を返すべき', async () => {
      vi.mocked(getTags).mockResolvedValue([
        { id: 1, name: 'CSS', blogIds: [1, 2], talkCount: 1 },
        { id: 2, name: 'React', blogIds: [2], talkCount: 0 },
      ]);

      await expect(getTagSummaries()).resolves.toStrictEqual([
        { id: 1, name: 'CSS', blogCount: 2, talkCount: 1 },
        { id: 2, name: 'React', blogCount: 1, talkCount: 0 },
      ]);
    });
  });

  describe('エッジケース', () => {
    it('MDXの無い公開済みの記事は数えないべき', async () => {
      vi.mocked(getTags).mockResolvedValue([
        { id: 1, name: 'CSS', blogIds: [1, 7], talkCount: 0 },
        { id: 9, name: 'Draft', blogIds: [7], talkCount: 0 },
      ]);

      await expect(getTagSummaries()).resolves.toStrictEqual([
        { id: 1, name: 'CSS', blogCount: 1, talkCount: 0 },
        { id: 9, name: 'Draft', blogCount: 0, talkCount: 0 },
      ]);
    });
  });
});

describe('getTagContent', () => {
  beforeEach(() => {
    vi.mocked(getBlogContents).mockResolvedValue([
      blog(1, '記事1'),
      blog(2, '記事2'),
    ]);
  });

  describe('正常系', () => {
    it('タグの記事にMDXの題を付け、トークと一緒に返すべき', async () => {
      vi.mocked(getTag).mockResolvedValue({
        id: 1,
        name: 'CSS',
        blogs: [{ id: 2, slug: 'blog-2' }],
        talks: [{ id: 3, title: 'トーク3' }],
      });

      await expect(getTagContent(1)).resolves.toStrictEqual({
        id: 1,
        name: 'CSS',
        blogs: [{ id: 2, slug: 'blog-2', title: '記事2' }],
        talks: [{ id: 3, title: 'トーク3' }],
      });
    });
  });

  describe('エッジケース', () => {
    it('MDXの無い公開済みの記事は外すべき', async () => {
      vi.mocked(getTag).mockResolvedValue({
        id: 9,
        name: 'Draft',
        blogs: [
          { id: 7, slug: 'no-mdx' },
          { id: 1, slug: 'blog-1' },
        ],
        talks: [],
      });

      const tag = await getTagContent(9);

      expect(tag.blogs).toStrictEqual([
        { id: 1, slug: 'blog-1', title: '記事1' },
      ]);
    });
  });
});
