import { db } from '@repo/database';
import { getBlogMetadata } from '@/services/blogs/blog';
import { getTag } from './tag';

vi.mock('@/database/db', () => ({
  db: {
    query: {
      tags: {
        findFirst: vi.fn(),
      },
    },
  },
}));
vi.mock('@/services/blogs/blog');

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
      serviceTag: [
        {
          id: 1,
          service: {
            id: 1,
            name: 'ArteOdyssey',
            slug: 'design-system',
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
    const mockGetBlogMetadata = vi.fn().mockResolvedValue({
      title: 'Blog Title',
      slug: 'blog1',
    });
    vi.mocked(getBlogMetadata).mockImplementation(mockGetBlogMetadata);

    const tag = await getTag(1);

    expect(tag).toEqual({
      id: 1,
      name: 'tag1',
      blogs: [
        {
          id: 1,
          slug: 'blog1',
          title: 'Blog Title',
        },
      ],
      services: [
        {
          id: 1,
          slug: 'design-system',
          title: 'ArteOdyssey',
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
  it('タグが存在しない場合はnullを返す', async () => {
    const mockFirst = vi.fn().mockResolvedValue(null);
    vi.mocked(db.query.tags.findFirst).mockImplementation(mockFirst);

    const tag = await getTag(1);

    expect(tag).toBeNull();
  });
});
