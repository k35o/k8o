import { describe, expect, it, vi } from 'vitest';

import { findTagRow } from '../infrastructure/tag-repository';
import { getTag } from './tag';

vi.mock('../infrastructure/tag-repository', () => ({
  findTagRow: vi.fn(),
}));

type TagRow = NonNullable<Awaited<ReturnType<typeof findTagRow>>>;

const blogTag = (
  blogId: number,
  slug: string,
  published: boolean,
): TagRow['blogTag'][number] => ({
  blogId,
  tagId: 1,
  blog: {
    id: blogId,
    slug,
    published,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
});

const talkTag = (talkId: number, title: string): TagRow['talkTag'][number] => ({
  talkId,
  tagId: 1,
  talk: {
    id: talkId,
    title,
    eventUrl: 'https://example.com/event',
    eventName: 'Event',
    eventDate: '2026-01-01',
    eventLocation: null,
    slideUrl: 'https://example.com/slide',
    blogId: 1,
  },
});

describe('getTag', () => {
  describe('正常系', () => {
    it('タグの名前と、記事の slug とトークの題を返す', async () => {
      vi.mocked(findTagRow).mockResolvedValue({
        id: 1,
        name: 'CSS',
        blogTag: [blogTag(1, 'blog1', true)],
        talkTag: [talkTag(1, 'Talk Title')],
      });

      const tag = await getTag(1);

      expect(tag).toStrictEqual({
        id: 1,
        name: 'CSS',
        blogs: [{ id: 1, slug: 'blog1' }],
        talks: [{ id: 1, title: 'Talk Title' }],
      });
    });

    it('下書きの記事は除く', async () => {
      vi.mocked(findTagRow).mockResolvedValue({
        id: 1,
        name: 'CSS',
        blogTag: [blogTag(1, 'blog1', true), blogTag(2, 'draft-blog', false)],
        talkTag: [],
      });

      const tag = await getTag(1);

      expect(tag?.blogs).toStrictEqual([{ id: 1, slug: 'blog1' }]);
    });
  });

  describe('異常系', () => {
    it('タグが無ければ null を返す', async () => {
      vi.mocked(findTagRow).mockResolvedValue(undefined);

      const tag = await getTag(999);

      expect(tag).toBeNull();
    });
  });
});
