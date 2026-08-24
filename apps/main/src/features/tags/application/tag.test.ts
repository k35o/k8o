import { db } from '@repo/database';

import { getTag } from './tag';

vi.mock('@repo/database', () => ({
  db: {
    query: {
      tags: {
        findFirst: vi.fn(),
      },
    },
  },
}));

describe('getTag', () => {
  it('タグの詳細を取得できる', async () => {
    const mockFirst = vi.fn().mockResolvedValue({
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
      talkTag: [
        {
          id: 1,
          talk: {
            id: 1,
            title: 'Talk Title',
          },
        },
      ],
    });
    vi.mocked(db.query.tags.findFirst).mockImplementation(mockFirst);

    const tag = await getTag(1);

    expect(tag).toStrictEqual({
      id: 1,
      name: 'tag1',
      blogs: [
        {
          id: 1,
          slug: 'blog1',
        },
      ],
      talks: [
        {
          id: 1,
          title: 'Talk Title',
        },
      ],
    });
  });
  it('非公開のブログはタグ詳細から除外される', async () => {
    const mockFirst = vi.fn().mockResolvedValue({
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
        {
          id: 2,
          blog: {
            id: 2,
            slug: 'draft-blog',
            published: false,
          },
        },
      ],
      talkTag: [],
    });
    vi.mocked(db.query.tags.findFirst).mockImplementation(mockFirst);

    const tag = await getTag(1);

    expect(tag?.blogs).toStrictEqual([
      {
        id: 1,
        slug: 'blog1',
      },
    ]);
  });

  it('タグが存在しない場合はnullを返す', async () => {
    const mockFirst = vi.fn().mockResolvedValue(null);
    vi.mocked(db.query.tags.findFirst).mockImplementation(mockFirst);

    const tag = await getTag(1);

    expect(tag).toBeNull();
  });
});
