import { db } from '@repo/database';
import { getFrontmatter } from '@repo/helpers/mdx/frontmatter';

import { slidePath } from './path';
import { getSlide, getSlideMetadata } from './slide';

vi.mock('@repo/database', () => ({
  db: {
    query: {
      slides: {
        findFirst: vi.fn(),
      },
    },
  },
}));
vi.mock('@repo/helpers/mdx/frontmatter');
vi.mock('./path');

describe('slide service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSlide', () => {
    it('スライドの詳細情報を取得できる', async () => {
      const mockSlide = {
        id: 1,
        slug: 'test-slug',
        published: true,
        createdAt: new Date().toISOString(),
        slideTag: [
          {
            tag: { id: 1, name: 'TypeScript' },
          },
          {
            tag: { id: 2, name: 'React' },
          },
        ],
      };

      vi.mocked(db.query.slides.findFirst).mockResolvedValue(mockSlide);

      const result = await getSlide('test-slug');

      expect(result).toStrictEqual({
        id: 1,
        slug: 'test-slug',
        tags: [
          { id: 1, name: 'TypeScript' },
          { id: 2, name: 'React' },
        ],
      });
    });

    it('存在しないスラッグの場合はエラーを投げる', async () => {
      vi.mocked(db.query.slides.findFirst).mockResolvedValue(undefined);

      await expect(getSlide('missing')).rejects.toThrow(
        'Slide not found: missing',
      );
    });
  });

  describe('getSlideMetadata', () => {
    it('frontmatterを返す', async () => {
      const mockMetadata = {
        title: 'Test Slide',
        description: 'desc',
        createdAt: '2026-05-15T00:00:00.000Z',
        updatedAt: '2026-05-15T00:00:00.000Z',
      };

      vi.mocked(slidePath).mockReturnValue('/path/to/slide');
      vi.mocked(getFrontmatter).mockResolvedValue(mockMetadata);

      const result = await getSlideMetadata('test-slug');

      expect(slidePath).toHaveBeenCalledWith('test-slug');
      expect(getFrontmatter).toHaveBeenCalledWith('/path/to/slide');
      expect(result).toBe(mockMetadata);
    });
  });
});
