import { describe, expect, it } from 'vitest';

import { smokeTargets } from './targets';

describe('smokeTargets', () => {
  describe('正常系', () => {
    it('サイトマップのページは 200、無いパスは 404 で開く', () => {
      expect(smokeTargets(['/', '/blog/abs-sign'], [])).toStrictEqual([
        { path: '/', expectedStatus: 200 },
        { path: '/blog/abs-sign', expectedStatus: 200 },
        { path: '/smoke-pages-not-found', expectedStatus: 404 },
      ]);
    });

    it('--only を渡すと、どれかの正規表現に合うパスだけを開く', () => {
      expect(
        smokeTargets(
          ['/', '/blog', '/blog/abs-sign', '/about'],
          [/^\/$/u, /^\/blog\/.+$/u],
        ),
      ).toStrictEqual([
        { path: '/', expectedStatus: 200 },
        { path: '/blog/abs-sign', expectedStatus: 200 },
      ]);
    });
  });

  describe('エッジケース', () => {
    it('無いパスも --only で選べる', () => {
      expect(smokeTargets(['/'], [/not-found/u])).toStrictEqual([
        { path: '/smoke-pages-not-found', expectedStatus: 404 },
      ]);
    });
  });
});
