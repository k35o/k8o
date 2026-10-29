import { describe, expect, it, vi } from 'vitest';

import { findTagRows } from '../infrastructure/tag-repository';
import { getTags } from './tags';

vi.mock('../infrastructure/tag-repository', () => ({
  findTagRows: vi.fn(),
}));

type TagRow = Awaited<ReturnType<typeof findTagRows>>[number];

const blogTag = (
  tagId: number,
  blogId: number,
  published: boolean,
): TagRow['blogTag'][number] => ({
  blogId,
  tagId,
  blog: {
    id: blogId,
    slug: `blog-${blogId.toString()}`,
    published,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
});

const talkTag = (tagId: number, talkId: number): TagRow['talkTag'][number] => ({
  talkId,
  tagId,
  talk: {
    id: talkId,
    title: `Talk ${talkId.toString()}`,
    eventUrl: 'https://example.com/event',
    eventName: 'Event',
    eventDate: '2026-01-01',
    eventLocation: null,
    slideUrl: 'https://example.com/slide',
    blogId: 1,
  },
});

describe('getTags', () => {
  describe('正常系', () => {
    it('タグごとに、公開済みの記事の数とトークの数を返す', async () => {
      vi.mocked(findTagRows).mockResolvedValue([
        {
          id: 1,
          name: 'CSS',
          blogTag: [blogTag(1, 1, true), blogTag(1, 2, true)],
          talkTag: [talkTag(1, 1)],
        },
        { id: 2, name: 'React', blogTag: [blogTag(2, 3, true)], talkTag: [] },
      ]);

      const tags = await getTags();

      expect(tags).toStrictEqual([
        { id: 1, name: 'CSS', blogCount: 2, talkCount: 1 },
        { id: 2, name: 'React', blogCount: 1, talkCount: 0 },
      ]);
    });

    it('下書きの記事は数えない', async () => {
      vi.mocked(findTagRows).mockResolvedValue([
        {
          id: 1,
          name: 'CSS',
          blogTag: [blogTag(1, 1, true), blogTag(1, 2, false)],
          talkTag: [],
        },
      ]);

      const tags = await getTags();

      expect(tags).toStrictEqual([
        { id: 1, name: 'CSS', blogCount: 1, talkCount: 0 },
      ]);
    });
  });

  describe('エッジケース', () => {
    it('中身が 0 件のタグも一覧に残す', async () => {
      vi.mocked(findTagRows).mockResolvedValue([
        {
          id: 1,
          name: ':playing',
          blogTag: [blogTag(1, 1, false)],
          talkTag: [],
        },
      ]);

      const tags = await getTags();

      expect(tags).toStrictEqual([
        { id: 1, name: ':playing', blogCount: 0, talkCount: 0 },
      ]);
    });
  });
});
