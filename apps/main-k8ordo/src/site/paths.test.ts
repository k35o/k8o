import { describe, expect, it } from 'vitest';

import { blogPathnames, playgroundPathnames, tagPathnames } from './paths';

describe('blogPathnames', () => {
  describe('正常系', () => {
    it('公開済みの記事の一覧1つから、記事のページ・markdown・OG のパスを作る', () => {
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
      expect(
        blogPathnames(['/blog/:slug', '/blog/:slug/article.md'], []),
      ).toStrictEqual([]);
    });
  });
});

describe('playgroundPathnames', () => {
  describe('正常系', () => {
    it('デモの id の一覧から、Playground のページと OG のパスを作る', () => {
      const pathnames = playgroundPathnames(
        ['/playgrounds/:id', '/playgrounds/:id/og.png'],
        ['abs-sign', 'popover'],
      );

      expect(pathnames).toStrictEqual([
        '/playgrounds/abs-sign',
        '/playgrounds/popover',
        '/playgrounds/abs-sign/og.png',
        '/playgrounds/popover/og.png',
      ]);
    });
  });

  describe('異常系', () => {
    it('Playground の下でないパターンにはパスを作らない（framework がビルドを止めて名指しする）', () => {
      const pathnames = playgroundPathnames(
        ['/blog/:slug', '/playgrounds-old/:id', '/tags/:id'],
        ['abs-sign'],
      );

      expect(pathnames).toStrictEqual([]);
    });
  });

  describe('エッジケース', () => {
    it('id が無ければ、Playground の下のパスを作らない', () => {
      expect(
        playgroundPathnames(
          ['/playgrounds/:id', '/playgrounds/:id/og.png'],
          [],
        ),
      ).toStrictEqual([]);
    });
  });
});

describe('tagPathnames', () => {
  describe('正常系', () => {
    it('タグの id の一覧から、タグのページのパスを作る', () => {
      const pathnames = tagPathnames(['/tags/:id'], [1, 33, 164]);

      expect(pathnames).toStrictEqual(['/tags/1', '/tags/33', '/tags/164']);
    });
  });

  describe('異常系', () => {
    it('タグの下でないパターンにはパスを作らない（framework がビルドを止めて名指しする）', () => {
      const pathnames = tagPathnames(
        ['/tags', '/blog/:slug', '/tags-old/:id', '/playgrounds/:id'],
        [1],
      );

      expect(pathnames).toStrictEqual([]);
    });
  });

  describe('エッジケース', () => {
    it('タグが無ければ、タグのページのパスを作らない', () => {
      expect(tagPathnames(['/tags/:id'], [])).toStrictEqual([]);
    });
  });
});
