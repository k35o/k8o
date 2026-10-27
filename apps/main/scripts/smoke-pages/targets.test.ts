import { describe, expect, it } from 'vitest';

import { smokeTargets } from './targets';

describe('smokeTargets', () => {
  describe('正常系', () => {
    it('サイトマップのページは 200、無いパスは 404 で開き、トップからだけ遷移を確かめる', () => {
      expect(smokeTargets(['/', '/blog/abs-sign'], [])).toStrictEqual([
        {
          path: '/',
          expectedStatus: 200,
          checksNavigation: true,
          takesScreenshot: true,
        },
        {
          path: '/blog/abs-sign',
          expectedStatus: 200,
          checksNavigation: false,
          takesScreenshot: false,
        },
        {
          path: '/smoke-pages-not-found',
          expectedStatus: 404,
          checksNavigation: false,
          takesScreenshot: true,
        },
      ]);
    });

    it('代表のページだけスクリーンショットを撮る', () => {
      expect(
        smokeTargets(
          [
            '/',
            '/blog',
            '/blog/font-family-math',
            '/blog/react19-usereducer-ts-type-inference',
            '/blog/alpha-function',
            '/blog/details-content',
            '/blog/abs-sign',
            '/playgrounds',
            '/playgrounds/alpha-function',
            '/playgrounds/abs-sign',
            '/slides/sample-deck',
            '/color-converter',
            '/palette-maker',
            '/about',
          ],
          [],
        )
          .filter(({ takesScreenshot }) => takesScreenshot)
          .map(({ path }) => path),
      ).toStrictEqual([
        '/',
        '/blog/font-family-math',
        '/blog/react19-usereducer-ts-type-inference',
        '/blog/alpha-function',
        '/blog/details-content',
        '/playgrounds',
        '/playgrounds/alpha-function',
        '/slides/sample-deck',
        '/color-converter',
        '/palette-maker',
        '/smoke-pages-not-found',
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
