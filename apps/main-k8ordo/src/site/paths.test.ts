import { describe, expect, it } from 'vitest';

import { blogPathnames } from './paths';

describe('blogPathnames', () => {
  describe('正常系', () => {
    it('公開済みの slug の一覧1つから、記事のページ・markdown・OG のパスを作る', () => {
      const pathnames = blogPathnames(
        ['/blog/:slug', '/blog/:slug/article.md', '/blog/:slug/og.png'],
        ['abs-sign', 'at-rule'],
      );

      expect(pathnames).toStrictEqual([
        '/blog/abs-sign',
        '/blog/at-rule',
        '/blog/abs-sign/article.md',
        '/blog/at-rule/article.md',
        '/blog/abs-sign/og.png',
        '/blog/at-rule/og.png',
      ]);
    });
  });

  describe('異常系', () => {
    it('記事の下でないパターンにはパスを作らない（framework がビルドを止めて名指しする）', () => {
      const pathnames = blogPathnames(
        ['/tags/:id', '/blogs/:slug', '/blog/:id/og.png'],
        ['abs-sign'],
      );

      expect(pathnames).toStrictEqual([]);
    });
  });

  describe('エッジケース', () => {
    it('公開済みの記事が無ければ、記事の下のパスを作らない', () => {
      expect(blogPathnames(['/blog/:slug/article.md'], [])).toStrictEqual([]);
    });
  });
});
