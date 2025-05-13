import { getTag, getTags } from './index';
import { db } from '#database/db';
import { getBlogMetadata } from '#services/blog';

vi.mock('#database/db');
vi.mock('#services/blog');

describe('Tags', () => {
  describe('getTags', () => {
    it('タグの一覧を取得できる', async () => {
      const mockMany = vi.fn().mockResolvedValue([
        {
          id: 1,
          name: 'tag1',
          blogTag: [
            {
              id: 1,
            },
          ],
          serviceTag: [],
        },
      ]);
      vi.mocked(db.query.tags.findMany).mockImplementation(mockMany);

      const tags = await getTags(1);

      expect(tags).toHaveLength(1);
      expect(tags[0]?.name).toBe('tag1');
      expect(tags[0]?.blogCount).toBe(1);
      expect(tags[0]?.serviceCount).toBe(0);
    });
  });
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
      });
      vi.mocked(db.query.tags.findFirst).mockImplementation(
        mockFirst,
      );
      const mockGetBlogMetadata = vi.fn().mockResolvedValue({
        title: 'Blog Title',
        slug: 'blog1',
      });
      vi.mocked(getBlogMetadata).mockImplementation(
        mockGetBlogMetadata,
      );

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
      });
    });
    it('タグが存在しない場合はnullを返す', async () => {
      const mockFirst = vi.fn().mockResolvedValue(null);
      vi.mocked(db.query.tags.findFirst).mockImplementation(
        mockFirst,
      );

      const tag = await getTag(1);

      expect(tag).toBeNull();
    });
  });
});
