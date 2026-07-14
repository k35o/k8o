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
  });
});
