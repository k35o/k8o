import { db } from '@repo/database';

import { getSlides } from './slides';

vi.mock('@repo/database', () => ({
  db: {
    query: {
      slides: {
        findMany: vi.fn(),
      },
    },
  },
}));

describe('slides service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSlides', () => {
    it('公開スライドの一覧を取得する', async () => {
      const mockSlides = [
        {
          id: 1,
          slug: 'slide-1',
          published: true,
          createdAt: new Date().toISOString(),
          slideTag: [{ tag: { name: 'TypeScript' } }, { tag: { name: 'CSS' } }],
        },
        {
          id: 2,
          slug: 'slide-2',
          published: true,
          createdAt: new Date().toISOString(),
          slideTag: [],
        },
      ];

      vi.mocked(db.query.slides.findMany).mockResolvedValue(mockSlides);

      const result = await getSlides();

      expect(result).toStrictEqual([
        { id: 1, slug: 'slide-1', tags: ['TypeScript', 'CSS'] },
        { id: 2, slug: 'slide-2', tags: [] },
      ]);
    });

    it('空配列の場合は空配列を返す', async () => {
      vi.mocked(db.query.slides.findMany).mockResolvedValue([]);

      const result = await getSlides();

      expect(result).toStrictEqual([]);
    });

    it('公開スライドが100件を超えても全件取得する', async () => {
      // サイトマップ・フィードが getSlideContents 経由でこの結果を全件前提で
      // 使うため、クエリに件数上限を設けないことを保証する
      const mockSlides = Array.from({ length: 150 }, (_, i) => ({
        id: i + 1,
        slug: `slide-${(i + 1).toString()}`,
        published: true,
        createdAt: new Date().toISOString(),
        slideTag: [],
      }));

      vi.mocked(db.query.slides.findMany).mockResolvedValue(mockSlides);

      const result = await getSlides();

      expect(result).toHaveLength(150);
      expect(db.query.slides.findMany).toHaveBeenCalledWith(
        expect.not.objectContaining({ limit: expect.anything() }),
      );
    });
  });
});
