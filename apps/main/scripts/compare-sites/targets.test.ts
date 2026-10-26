import { describe, expect, it } from 'vitest';

import {
  buildTargets,
  filterTargets,
  isProductionOrigin,
  parseSitemapPaths,
  resolveOn,
} from './targets';
import type { Target } from './targets';

const get = (path: string): Target => ({
  label: path,
  path,
  accept: null,
  method: 'GET',
  checksCdnCache: false,
});

const markdown = (path: string): Target => ({
  ...get(path),
  label: `${path} (Accept: text/markdown)`,
  accept: 'text/markdown',
});

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
    it('固定の URL・Markdown の出し分け・無いパス・末尾スラッシュのあとに、サイトマップのページを並べる', () => {
      expect(buildTargets(['/', '/about'])).toStrictEqual([
        get('/sitemap.xml'),
        get('/robots.txt'),
        get('/manifest.webmanifest'),
        get('/llms.txt'),
        get('/blog/feed'),
        markdown('/blog/feed'),
        get('/slides/feed'),
        {
          ...get('/reading-list/feed'),
          label: '/reading-list/feed (2回目)',
          checksCdnCache: true,
        },
        get('/reading-list/feed?utm=1'),
        get('/notifications'),
        get('/favicon.ico'),
        get('/icon.png'),
        get('/apple-icon.png'),
        get('/icon-192.png'),
        get('/badge-72.png'),
        get('/sw.js'),
        get('/ga-init.js'),
        get('/playgrounds/shared-worker.worker.js'),
        get('/playgrounds/media-pseudos-tone.wav'),
        get('/_vercel/speed-insights/script.js'),
        markdown('/'),
        get('/compare-sites-not-found'),
        markdown('/compare-sites-not-found'),
        get('/blog/compare-sites-not-found'),
        get('/blog/compare-sites-not-found.md'),
        {
          ...get('/blog/compare-sites-not-found.md'),
          label: 'HEAD /blog/compare-sites-not-found.md',
          method: 'HEAD',
        },
        markdown('/blog/compare-sites-not-found'),
        get('/tags/999999'),
        get('/playgrounds/compare-sites-not-found'),
        get('/about/'),
        get('/about/?x=1'),
        get('/'),
        get('/about'),
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

    it('記事には .md の GET と HEAD、Accept: text/markdown の取り直し、og.png を続ける', () => {
      expect(buildTargets(['/blog/abs-sign']).slice(-5)).toStrictEqual([
        get('/blog/abs-sign'),
        get('/blog/abs-sign.md'),
        {
          ...get('/blog/abs-sign.md'),
          label: 'HEAD /blog/abs-sign.md',
          method: 'HEAD',
        },
        markdown('/blog/abs-sign'),
        get('/blog/abs-sign/og.png'),
      ]);
    });
  });

  describe('異常系', () => {
    it('無い記事の og.png は取らない', () => {
      const labels = buildTargets([]).map((target) => target.label);

      expect(labels).toContain('/blog/compare-sites-not-found.md');
      expect(labels).not.toContain('/blog/compare-sites-not-found/og.png');
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

describe('filterTargets', () => {
  const targets = [
    get('/'),
    get('/blog/abs-sign'),
    get('/blog/abs-sign.md'),
    markdown('/blog/abs-sign'),
    get('/about/?x=1'),
  ];

  describe('正常系', () => {
    it('パスがどれかの正規表現に合う対象だけを残す', () => {
      expect(
        filterTargets(targets, [/^\/blog\/abs-sign$/u, /^\/$/u]),
      ).toStrictEqual([
        get('/'),
        get('/blog/abs-sign'),
        markdown('/blog/abs-sign'),
      ]);
    });

    it('クエリも含めたパスに当てる', () => {
      expect(filterTargets(targets, [/\?x=1$/u])).toStrictEqual([
        get('/about/?x=1'),
      ]);
    });
  });

  describe('エッジケース', () => {
    it('指定が無ければすべてを残す', () => {
      expect(filterTargets(targets, [])).toStrictEqual(targets);
    });
  });
});

describe('isProductionOrigin', () => {
  describe('正常系', () => {
    it('https://k8o.me なら本番とみなす', () => {
      expect(isProductionOrigin('https://k8o.me')).toBe(true);
      expect(isProductionOrigin('https://k8o.me/blog')).toBe(true);
    });
  });

  describe('エッジケース', () => {
    it('www や preview、手元のオリジンは本番とみなさない', () => {
      expect(isProductionOrigin('https://www.k8o.me')).toBe(false);
      expect(isProductionOrigin('https://main-abc-k35o.vercel.app')).toBe(
        false,
      );
      expect(isProductionOrigin('http://k8o.me')).toBe(false);
      expect(isProductionOrigin('http://127.0.0.1:4510')).toBe(false);
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
