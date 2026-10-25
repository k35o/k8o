import { describe, expect, it } from 'vitest';

import { smokeTargets } from './targets';

describe('smokeTargets', () => {
  describe('正常系', () => {
    it('サイトマップのページは 200、無いパスは 404 で開き、トップからだけ遷移を確かめる', () => {
      expect(smokeTargets(['/', '/blog/abs-sign'], [])).toStrictEqual([
        { path: '/', expectedStatus: 200, checksNavigation: true },
        {
          path: '/blog/abs-sign',
          expectedStatus: 200,
          checksNavigation: false,
        },
        {
          path: '/smoke-pages-not-found',
          expectedStatus: 404,
          checksNavigation: false,
        },
      ]);
    });

    it('--only を渡すと、どれかの正規表現に合うパスだけを開く', () => {
      expect(
        smokeTargets(
          ['/', '/blog', '/blog/abs-sign', '/about'],
          [/^\/$/u, /^\/blog\/.+$/u],
        ).map(({ path }) => path),
      ).toStrictEqual(['/', '/blog/abs-sign']);
    });
  });

  describe('エッジケース', () => {
    it('無いパスも --only で選べる', () => {
      expect(
        smokeTargets(['/'], [/not-found/u]).map(({ path }) => path),
      ).toStrictEqual(['/smoke-pages-not-found']);
    });
  });
});
