import { describe, expect, it, vi } from 'vitest';

import { findPublishedSlideRows } from '../infrastructure/slide-repository';
import { getSlides } from './slides';

vi.mock('../infrastructure/slide-repository', () => ({
  findPublishedSlideRows: vi.fn(),
}));

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

describe('getSlides', () => {
  describe('正常系', () => {
    it('公開スライドの一覧を、タグの名前つきで返す', async () => {
      vi.mocked(findPublishedSlideRows).mockResolvedValue([
        row(1, 'slide-1', ['TypeScript', 'CSS']),
        row(2, 'slide-2', []),
      ]);

      const result = await getSlides();

      expect(result).toStrictEqual([
        { id: 1, slug: 'slide-1', tags: ['TypeScript', 'CSS'] },
        { id: 2, slug: 'slide-2', tags: [] },
      ]);
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
