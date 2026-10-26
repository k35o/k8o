import { describe, expect, it, vi } from 'vitest';

import { findTalkRows } from '../infrastructure/talk-repository';
import { getTalks } from './talks';

vi.mock('../infrastructure/talk-repository', () => ({
  findTalkRows: vi.fn(),
}));

describe('getTalks', () => {
  describe('正常系', () => {
    it('Talks の一覧を、記事の slug とタグつきで返す', async () => {
      vi.mocked(findTalkRows).mockResolvedValue([
        {
          id: 1,
          title: 'Talk 1',
          eventUrl: 'https://example.com/event1',
          eventName: 'Event 1',
          eventDate: '2023-01-01',
          eventLocation: 'Location 1',
          slideUrl: 'https://example.com/slide1',
          blogId: 1,
          blog: {
            id: 1,
            slug: 'blog1',
            published: true,
            createdAt: '2023-01-01T00:00:00.000Z',
          },
          talkTag: [{ talkId: 1, tagId: 1, tag: { id: 1, name: 'Tag 1' } }],
        },
      ]);

      const talks = await getTalks();

      expect(talks).toStrictEqual([
        {
          id: 1,
          title: 'Talk 1',
          eventUrl: 'https://example.com/event1',
          eventName: 'Event 1',
          eventDate: '2023-01-01',
          eventLocation: 'Location 1',
          slideUrl: 'https://example.com/slide1',
          blogId: 1,
          blog: { id: 1, slug: 'blog1' },
          tags: [{ id: 1, name: 'Tag 1' }],
        },
      ]);
    });
  });
});
