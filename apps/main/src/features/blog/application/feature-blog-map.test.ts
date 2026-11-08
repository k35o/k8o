import { describe, expect, it, vi } from 'vitest';

import type { Blog } from './blogs';
import { buildFeatureBlogMap } from './feature-blog-map';

const blog = (slug: string, featureIds: string[]): Blog => ({
  id: 1,
  slug,
  tags: [],
  slideUrl: null,
  title: `題 ${slug}`,
  description: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  featureIds,
});

describe('buildFeatureBlogMap', () => {
  describe('正常系', () => {
    it('記事の featureIds から、機能ごとに記事の slug と題を引ける表を作る', () => {
      expect(
        buildFeatureBlogMap([
          blog('blog-a', ['feature-1', 'feature-2']),
          blog('blog-b', ['feature-3']),
        ]),
      ).toStrictEqual({
        'feature-1': { slug: 'blog-a', title: '題 blog-a' },
        'feature-2': { slug: 'blog-a', title: '題 blog-a' },
        'feature-3': { slug: 'blog-b', title: '題 blog-b' },
      });
    });
  });

  describe('エッジケース', () => {
    it('featureIds の無い記事は表に入れない', () => {
      expect(buildFeatureBlogMap([blog('blog-a', [])])).toStrictEqual({});
    });

    it('同じ featureId を複数の記事が持つときは、一覧で先の記事を使い、警告を出す', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = buildFeatureBlogMap([
        blog('newer', ['feature-1']),
        blog('older', ['feature-1']),
      ]);

      expect(result).toStrictEqual({
        'feature-1': { slug: 'newer', title: '題 newer' },
      });
      expect(warn).toHaveBeenCalledWith(
        'featureId "feature-1" が複数の記事で指定されています: newer, older（newer を使用）',
      );
      warn.mockRestore();
    });
  });
});
