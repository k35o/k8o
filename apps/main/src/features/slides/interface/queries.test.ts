import {
  findSlideMetadata,
  getSlide,
  getSlideMetadata,
} from '@/features/slides/application/slide';
import { getSlides } from '@/features/slides/application/slides';

import { getSlideContent, getSlideContents } from './queries';

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));
vi.mock('@/features/slides/application/slide', () => ({
  findSlideMetadata: vi.fn(),
  getSlide: vi.fn(),
  getSlideMetadata: vi.fn(),
}));
vi.mock('@/features/slides/application/slides', () => ({
  getSlides: vi.fn(),
}));

const metadata = (title: string) => ({
  title,
  description: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('getSlideContents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('正常系', () => {
    it('スライド一覧をメタデータつきで返す', async () => {
      vi.mocked(getSlides).mockResolvedValue([
        { id: 1, slug: 'slide-a', tags: ['TypeScript'] },
        { id: 2, slug: 'slide-b', tags: [] },
      ]);
      vi.mocked(findSlideMetadata).mockImplementation((slug) =>
        Promise.resolve(metadata(`タイトル: ${slug}`)),
      );

      const result = await getSlideContents();

      expect(result).toStrictEqual([
        {
          id: 1,
          slug: 'slide-a',
          tags: ['TypeScript'],
          title: 'タイトル: slide-a',
          description: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 2,
          slug: 'slide-b',
          tags: [],
          title: 'タイトル: slide-b',
          description: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ]);
    });
  });

  describe('異常系', () => {
    it('MDXファイルが無いスライドは一覧から除外される', async () => {
      vi.mocked(getSlides).mockResolvedValue([
        { id: 1, slug: 'slide-a', tags: [] },
        { id: 2, slug: 'missing-slide', tags: [] },
      ]);
      // getSlidesの並び順どおりに呼ばれる: slide-a → missing-slide
      vi.mocked(findSlideMetadata)
        .mockResolvedValueOnce(metadata('スライドA'))
        .mockResolvedValueOnce(null);

      const result = await getSlideContents();

      expect(result).toHaveLength(1);
      expect(result[0]?.slug).toBe('slide-a');
    });
  });
});

describe('getSlideContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('異常系', () => {
    it('MDXファイルが無い場合は例外を投げる（詳細ページは一覧と違いエラーにする）', async () => {
      vi.mocked(getSlide).mockResolvedValue({
        id: 1,
        slug: 'missing-slide',
        tags: [],
      });
      vi.mocked(getSlideMetadata).mockRejectedValue(
        Object.assign(new Error('ENOENT: no such file or directory'), {
          code: 'ENOENT',
        }),
      );

      await expect(getSlideContent('missing-slide')).rejects.toThrow('ENOENT');
    });
  });
});
