import { afterEach, describe, expect, it, vi } from 'vitest';

import { findTalkRows } from '../infrastructure/site-content-repository';
import { getTalks } from './site-content';

vi.mock('../infrastructure/site-content-repository', () => ({
  findPublishedBlogRows: vi.fn(),
  findTagRows: vi.fn(),
  findTalkRows: vi.fn(),
}));

type TalkRow = Awaited<ReturnType<typeof findTalkRows>>[number];

const talkRow = (blog: TalkRow['blog']): TalkRow => ({
  id: 1,
  title: 'トーク',
  slug: 'talk',
  deckPublishedAt: null,
  eventUrl: 'https://example.com/event',
  eventName: 'イベント',
  eventDate: '2026-11-21',
  eventLocation: null,
  slideUrl: null,
  blogId: blog?.id ?? null,
  blog,
  talkTag: [],
});

const now = new Date('2026-11-26T00:00:00.000Z');

describe('getTalks', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('正常系', () => {
    it('公開済みの記事を解説に持つトークは、その記事の id と slug を返す', async () => {
      vi.mocked(findTalkRows).mockResolvedValue([
        talkRow({ id: 7, slug: 'media-pseudos', published: true }),
      ]);

      const [talk] = await getTalks(now);

      expect(talk?.blog).toStrictEqual({ id: 7, slug: 'media-pseudos' });
    });
  });

  describe('エッジケース', () => {
    it('下書きの記事を解説に持つトークは、記事を持たないものとして返す', async () => {
      vi.mocked(findTalkRows).mockResolvedValue([
        talkRow({ id: 7, slug: 'draft', published: false }),
      ]);

      const [talk] = await getTalks(now);

      expect(talk?.blog).toBeNull();
    });
  });
});
