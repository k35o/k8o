import { isNotFound } from '@k8ordo/framework';
import { describe, expect, it, vi } from 'vitest';

import { getSlides } from '@/features/slides/application/slides';

import { findSlideContent, getSlideContent } from './queries';

vi.mock('@/features/slides/application/slides', () => ({
  getSlides: vi.fn(),
}));

const slide = (id: number, slug: string) => ({
  id,
  slug,
  tags: [],
  title: `タイトル: ${slug}`,
  description: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('findSlideContent', () => {
  describe('正常系', () => {
    it('公開スライドの一覧から slug の一致するものを返す', async () => {
      vi.mocked(getSlides).mockResolvedValue([
        slide(1, 'slide-a'),
        slide(2, 'slide-b'),
      ]);

      await expect(findSlideContent('slide-b')).resolves.toStrictEqual(
        slide(2, 'slide-b'),
      );
    });
  });

  describe('異常系', () => {
    it('一覧に無い slug には undefined を返す', async () => {
      vi.mocked(getSlides).mockResolvedValue([slide(1, 'slide-a')]);

      await expect(
        findSlideContent('unpublished-slide'),
      ).resolves.toBeUndefined();
    });
  });
});

describe('getSlideContent', () => {
  describe('正常系', () => {
    it('公開スライドの一覧から slug の一致するものを返す', async () => {
      vi.mocked(getSlides).mockResolvedValue([
        slide(1, 'slide-a'),
        slide(2, 'slide-b'),
      ]);

      await expect(getSlideContent('slide-b')).resolves.toStrictEqual(
        slide(2, 'slide-b'),
      );
    });
  });

  describe('異常系', () => {
    it('一覧に無い slug は notFound() で 404 にする（paths に挙げた slug ならビルドが止まる）', async () => {
      vi.mocked(getSlides).mockResolvedValue([slide(1, 'slide-a')]);

      await expect(getSlideContent('unpublished-slide')).rejects.toSatisfy(
        isNotFound,
      );
    });
  });
});
