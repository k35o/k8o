import { getTalks } from './index';
import { db } from '#database/db';

vi.mock('#database/db');

describe('talks', () => {
  describe('getTalks', () => {
    it('Talksの一覧を取得できる', async () => {
      const mockMany = vi.fn().mockResolvedValue([
        {
          id: 1,
          title: 'Talk 1',
          eventUrl: 'https://example.com/event1',
          eventName: 'Event 1',
          eventDate: new Date('2023-01-01'),
          eventLocation: 'Location 1',
          slideUrl: 'https://example.com/slide1',
          blogId: 1,
          blog: {
            id: 1,
            slug: 'blog1',
          },
          talkTag: [
            {
              tag: {
                id: 1,
                name: 'Tag 1',
              },
            },
          ],
        },
      ]);
      vi.mocked(db.query.talks.findMany).mockImplementation(mockMany);

      const tags = await getTalks();

      expect(tags).toHaveLength(1);
    });
  });
});
