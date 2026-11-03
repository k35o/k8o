import { describe, expect, it, vi } from 'vitest';

import { findPublishedSlideRows } from '../infrastructure/slide-repository';
import { findSlideMetadata } from './slide';
import { getSlides } from './slides';

vi.mock('../infrastructure/slide-repository', () => ({
  findPublishedSlideRows: vi.fn(),
}));
vi.mock('./slide');

type SlideRow = Awaited<ReturnType<typeof findPublishedSlideRows>>[number];

const row = (id: number, slug: string, tagNames: string[]): SlideRow => ({
  id,
  slug,
  published: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  slideTag: tagNames.map((name, index) => ({
    slideId: id,
    tagId: index + 1,
    tag: { id: index + 1, name },
  })),
});

const metadata = (title: string) => ({
  title,
  description: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('getSlides', () => {
  describe('正常系', () => {
    it('公開スライドを、タグの名前と MDX のメタデータつきで一覧の並びのまま返す', async () => {
      vi.mocked(findPublishedSlideRows).mockResolvedValue([
        row(2, 'slide-b', ['TypeScript', 'CSS']),
        row(1, 'slide-a', []),
      ]);
      vi.mocked(findSlideMetadata).mockImplementation((slug) =>
        Promise.resolve(metadata(`タイトル: ${slug}`)),
      );

      const result = await getSlides();

      expect(result).toStrictEqual([
        {
          id: 2,
          slug: 'slide-b',
          tags: ['TypeScript', 'CSS'],
          title: 'タイトル: slide-b',
          description: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 1,
          slug: 'slide-a',
          tags: [],
          title: 'タイトル: slide-a',
          description: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ]);
    });
  });

  describe('異常系', () => {
    it('DB では公開済みでも MDX が無いスライドは挙げない', async () => {
      vi.mocked(findPublishedSlideRows).mockResolvedValue([
        row(1, 'slide-a', []),
        row(2, 'missing-slide', []),
      ]);
      // 行の並びのとおりに呼ばれる: slide-a → missing-slide
      vi.mocked(findSlideMetadata)
        .mockResolvedValueOnce(metadata('スライドA'))
        .mockResolvedValueOnce(null);

      const result = await getSlides();

      expect(result.map((slide) => slide.slug)).toStrictEqual(['slide-a']);
    });
  });

  describe('エッジケース', () => {
    it('公開スライドが無ければ空の配列を返す', async () => {
      vi.mocked(findPublishedSlideRows).mockResolvedValue([]);

      const result = await getSlides();

      expect(result).toStrictEqual([]);
    });
  });
});
