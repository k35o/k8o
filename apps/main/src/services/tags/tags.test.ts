import { db } from '@repo/database';
import { getTags } from './tags';

vi.mock('@/database/db', () => ({
  db: {
    query: {
      tags: {
        findMany: vi.fn(),
      },
    },
  },
}));

describe('getTags', () => {
  it('タグの一覧を取得できる', async () => {
    const mockMany = vi.fn().mockResolvedValue([
      {
        id: 1,
        name: 'tag1',
        blogTag: [
          {
            id: 1,
            blog: {
              id: 1,
              slug: 'blog1',
              published: true,
            },
          },
        ],
        serviceTag: [],
        talkTag: [
          {
            id: 1,
            talk: {
              id: 1,
              title: 'Talk Title',
            },
          },
        ],
      },
    ]);
    vi.mocked(db.query.tags.findMany).mockImplementation(mockMany);

    const tags = await getTags(1);

    expect(tags).toHaveLength(1);
    expect(tags[0]?.name).toBe('tag1');
    expect(tags[0]?.blogCount).toBe(1);
    expect(tags[0]?.serviceCount).toBe(0);
    expect(tags[0]?.talkCount).toBe(1);
  });
});
