import { describe, expect, it } from 'vitest';

import { expandPathnames } from './paths.ts';

const PATTERNS = [
  '/',
  '/blog',
  '/blog/:slug',
  '/blog/:slug/article.md',
  '/blog/:slug/og.png',
  '/blogs/:slug',
  '/tags/:id',
];

describe('expandPathnames', () => {
  describe('正常系', () => {
    it('base とその下のパターンの :param を、値ごとに置き換える', () => {
      expect(
        expandPathnames(PATTERNS, '/blog/:slug', ['a', 'b']),
      ).toStrictEqual([
        '/blog/a',
        '/blog/b',
        '/blog/a/article.md',
        '/blog/b/article.md',
        '/blog/a/og.png',
        '/blog/b/og.png',
      ]);
    });

    it('数の値は文字にして置き換える', () => {
      expect(expandPathnames(PATTERNS, '/tags/:id', [3, 12])).toStrictEqual([
        '/tags/3',
        '/tags/12',
      ]);
    });
  });

  describe('異常系', () => {
    it('base の下でないパターンには作らない（/blogs/:slug は /blog/:slug の下ではない）', () => {
      const pathnames = expandPathnames(PATTERNS, '/blog/:slug', ['a']);

      expect(pathnames).not.toContain('/blogs/a');
      expect(pathnames).not.toContain('/tags/a');
    });
  });

  describe('エッジケース', () => {
    it('値が無ければパスを作らない', () => {
      expect(expandPathnames(PATTERNS, '/blog/:slug', [])).toStrictEqual([]);
    });

    it('base のパターンが無ければパスを作らない', () => {
      expect(
        expandPathnames(['/', '/blog'], '/slides/:slug', ['deck']),
      ).toStrictEqual([]);
    });
  });
});
