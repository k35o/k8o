import { describe, expect, it } from 'vitest';

import { buildTargets, parseSitemapPaths, resolveOn } from './targets';

describe('parseSitemapPaths', () => {
  describe('正常系', () => {
    it('loc の URL からオリジンを外したパスを並べる', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://k8o.me</loc></url>
<url><loc>https://k8o.me/blog</loc><changefreq>weekly</changefreq></url>
<url><loc>https://k8o.me/blog/abs-sign</loc></url>
</urlset>`;

      expect(parseSitemapPaths(xml)).toStrictEqual([
        '/',
        '/blog',
        '/blog/abs-sign',
      ]);
    });

    it('クエリはエンティティを戻して残す', () => {
      const xml =
        '<urlset><url><loc>https://k8o.me/search?q=css&amp;page=2</loc></url></urlset>';

      expect(parseSitemapPaths(xml)).toStrictEqual(['/search?q=css&page=2']);
    });
  });

  describe('エッジケース', () => {
    it('同じパスは最初の1つだけにする', () => {
      const xml =
        '<urlset><url><loc>https://k8o.me/about</loc></url><url><loc>https://k8o.me/about</loc></url></urlset>';

      expect(parseSitemapPaths(xml)).toStrictEqual(['/about']);
    });

    it('loc が無ければ空にする', () => {
      expect(parseSitemapPaths('<urlset></urlset>')).toStrictEqual([]);
    });
  });
});

describe('buildTargets', () => {
  describe('正常系', () => {
    it('固定の URL・トップの Markdown・無いパス・末尾スラッシュのあとに、サイトマップのページを並べる', () => {
      expect(buildTargets(['/', '/about'])).toStrictEqual([
        { label: '/sitemap.xml', path: '/sitemap.xml', accept: null },
        { label: '/robots.txt', path: '/robots.txt', accept: null },
        {
          label: '/manifest.webmanifest',
          path: '/manifest.webmanifest',
          accept: null,
        },
        { label: '/llms.txt', path: '/llms.txt', accept: null },
        { label: '/md/home', path: '/md/home', accept: null },
        { label: '/blog/feed', path: '/blog/feed', accept: null },
        { label: '/slides/feed', path: '/slides/feed', accept: null },
        {
          label: '/reading-list/feed',
          path: '/reading-list/feed',
          accept: null,
        },
        { label: '/notifications', path: '/notifications', accept: null },
        { label: '/favicon.ico', path: '/favicon.ico', accept: null },
        { label: '/icon.png', path: '/icon.png', accept: null },
        { label: '/apple-icon.png', path: '/apple-icon.png', accept: null },
        { label: '/icon-192.png', path: '/icon-192.png', accept: null },
        { label: '/badge-72.png', path: '/badge-72.png', accept: null },
        { label: '/sw.js', path: '/sw.js', accept: null },
        {
          label: '/playgrounds/shared-worker.worker.js',
          path: '/playgrounds/shared-worker.worker.js',
          accept: null,
        },
        {
          label: '/playgrounds/media-pseudos-tone.wav',
          path: '/playgrounds/media-pseudos-tone.wav',
          accept: null,
        },
        {
          label: '/ (Accept: text/markdown)',
          path: '/',
          accept: 'text/markdown',
        },
        {
          label: '/compare-sites-not-found',
          path: '/compare-sites-not-found',
          accept: null,
        },
        {
          label: '/compare-sites-not-found (Accept: text/markdown)',
          path: '/compare-sites-not-found',
          accept: 'text/markdown',
        },
        {
          label: '/blog/compare-sites-not-found',
          path: '/blog/compare-sites-not-found',
          accept: null,
        },
        {
          label: '/blog/compare-sites-not-found.md',
          path: '/blog/compare-sites-not-found.md',
          accept: null,
        },
        {
          label: '/blog/compare-sites-not-found (Accept: text/markdown)',
          path: '/blog/compare-sites-not-found',
          accept: 'text/markdown',
        },
        { label: '/about/', path: '/about/', accept: null },
        { label: '/', path: '/', accept: null },
        { label: '/about', path: '/about', accept: null },
      ]);
    });

    it('サイトマップで最初に見つかった記事だけを、末尾にスラッシュを付けて取る', () => {
      const labels = buildTargets([
        '/blog',
        '/blog/abs-sign',
        '/blog/at-rule',
      ]).map((target) => target.label);

      expect(labels.filter((label) => /^\/.+\/$/u.test(label))).toStrictEqual([
        '/about/',
        '/blog/abs-sign/',
      ]);
    });

    it('記事には .md と Accept: text/markdown の取り直しを続ける', () => {
      expect(buildTargets(['/blog/abs-sign']).slice(-3)).toStrictEqual([
        { label: '/blog/abs-sign', path: '/blog/abs-sign', accept: null },
        {
          label: '/blog/abs-sign.md',
          path: '/blog/abs-sign.md',
          accept: null,
        },
        {
          label: '/blog/abs-sign (Accept: text/markdown)',
          path: '/blog/abs-sign',
          accept: 'text/markdown',
        },
      ]);
    });
  });

  describe('エッジケース', () => {
    it('記事の一覧や記事の下の階層は記事として扱わない', () => {
      const labels = buildTargets(['/blog', '/blog/abs-sign/extra']).map(
        (target) => target.label,
      );

      expect(labels.slice(-2)).toStrictEqual(['/blog', '/blog/abs-sign/extra']);
    });

    it('固定の URL がサイトマップにもあれば1つにする', () => {
      const labels = buildTargets(['/llms.txt']).map((target) => target.label);

      expect(labels.filter((label) => label === '/llms.txt')).toHaveLength(1);
    });
  });
});

describe('resolveOn', () => {
  describe('正常系', () => {
    it('サイトの絶対 URL を比べる先のオリジンに付け替える', () => {
      expect(
        resolveOn(
          'http://localhost:3001',
          'https://k8o.me/blog/abs-sign/opengraph-image-knfcnm?9f0b089abad57d27',
        ),
      ).toBe(
        'http://localhost:3001/blog/abs-sign/opengraph-image-knfcnm?9f0b089abad57d27',
      );
    });

    it('パスはオリジンから解決する', () => {
      expect(resolveOn('https://k8o.me', '/blog/abs-sign.md')).toBe(
        'https://k8o.me/blog/abs-sign.md',
      );
    });
  });

  describe('エッジケース', () => {
    it('比べる先にパスが付いていてもオリジンから解決する', () => {
      expect(resolveOn('http://localhost:3001/blog', '/about')).toBe(
        'http://localhost:3001/about',
      );
    });
  });
});
