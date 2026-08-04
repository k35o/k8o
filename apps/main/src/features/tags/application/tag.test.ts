import { db } from '@repo/database';

import { findBlogMetadata } from '@/features/blog/application/blog';

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
vi.mock('@/features/blog/application/blog');

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
    vi.mocked(findBlogMetadata).mockResolvedValue({
      title: 'Blog Title',
      description: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    const tag = await getTag(1);

    expect(tag).toStrictEqual({
      id: 1,
      name: 'tag1',
      blogs: [
        {
          id: 1,
          slug: 'blog1',
          title: 'Blog Title',
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
  it('MDXファイルが無いブログはタグ詳細から除外される', async () => {
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
            slug: 'missing-blog',
            published: true,
          },
        },
      ],
      talkTag: [],
    });
    vi.mocked(db.query.tags.findFirst).mockImplementation(mockFirst);
    // blogTagの並び順どおりに呼ばれる: blog1 → missing-blog
    vi.mocked(findBlogMetadata)
      .mockResolvedValueOnce({
        title: 'Blog Title',
        description: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      })
      .mockResolvedValueOnce(null);

    const tag = await getTag(1);

    expect(tag?.blogs).toStrictEqual([
      {
        id: 1,
        slug: 'blog1',
        title: 'Blog Title',
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
