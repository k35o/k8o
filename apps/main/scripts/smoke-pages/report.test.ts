import { describe, expect, it } from 'vitest';

import {
  newProblems,
  renderScreenshotIndex,
  screenshotFileOf,
  summarizeReportOnly,
} from './report';

describe('summarizeReportOnly', () => {
  describe('正常系', () => {
    it('Trusted Types の違反を sink ごとにまとめ、出たページの数と最初の例を並べる', () => {
      expect(
        summarizeReportOnly([
          {
            reportOnly: [
              'require-trusted-types-for trusted-types-sink HTMLScriptElement src|/_next/static/chunks/a.js',
              'require-trusted-types-for trusted-types-sink HTMLScriptElement src|/_next/static/chunks/b.js',
              'require-trusted-types-for trusted-types-sink ServiceWorkerContainer register|/sw.js',
            ],
          },
          {
            reportOnly: [
              'require-trusted-types-for trusted-types-sink HTMLScriptElement src|/_next/static/chunks/c.js',
            ],
          },
        ]),
      ).toStrictEqual([
        {
          kind: 'require-trusted-types-for trusted-types-sink HTMLScriptElement src',
          pages: 2,
          example:
            'require-trusted-types-for trusted-types-sink HTMLScriptElement src|/_next/static/chunks/a.js',
        },
        {
          kind: 'require-trusted-types-for trusted-types-sink ServiceWorkerContainer register',
          pages: 1,
          example:
            'require-trusted-types-for trusted-types-sink ServiceWorkerContainer register|/sw.js',
        },
      ]);
    });
  });

  describe('エッジケース', () => {
    it('sample の無い違反は、そのまま1つの種類にする', () => {
      expect(
        summarizeReportOnly([
          { reportOnly: ['img-src https://example.com/a.png'] },
          { reportOnly: [] },
        ]),
      ).toStrictEqual([
        {
          kind: 'img-src https://example.com/a.png',
          pages: 1,
          example: 'img-src https://example.com/a.png',
        },
      ]);
    });
  });
});

describe('newProblems', () => {
  describe('正常系', () => {
    it('オリジンを除いて比べ、head にだけある誤りを並べる', () => {
      expect(
        newProblems(
          {
            origin: 'https://k8o.me',
            problems: [
              'console.error: Failed to load resource: 404 (https://k8o.me/a.js)',
              'pageerror: 前からある',
            ],
          },
          {
            origin: 'https://main-abc123-k35o.vercel.app',
            problems: [
              'console.error: Failed to load resource: 404 (https://main-abc123-k35o.vercel.app/a.js)',
              'pageerror: 前からある',
              'pageerror: 増えた (https://main-abc123-k35o.vercel.app/b.js)',
            ],
          },
        ),
      ).toStrictEqual([
        'pageerror: 増えた (https://main-abc123-k35o.vercel.app/b.js)',
      ]);
    });
  });

  describe('エッジケース', () => {
    it('base にだけある誤りは並べない', () => {
      expect(
        newProblems(
          { origin: 'https://k8o.me', problems: ['pageerror: 消えた'] },
          { origin: 'http://127.0.0.1:4511', problems: [] },
        ),
      ).toStrictEqual([]);
    });
  });
});

describe('screenshotFileOf', () => {
  describe('正常系', () => {
    it.each([
      ['/', 'index.jpeg'],
      ['/blog/font-family-math', 'blog_font-family-math.jpeg'],
      ['/smoke-pages-not-found', 'smoke-pages-not-found.jpeg'],
    ])('%s は %s に書く', (path, file) => {
      expect(screenshotFileOf(path)).toBe(file);
    });
  });
});

describe('renderScreenshotIndex', () => {
  describe('正常系', () => {
    it('パスごとに、base と head のスクリーンショットを並べる', () => {
      const html = renderScreenshotIndex(
        [
          { side: 'base', origin: 'https://k8o.me' },
          { side: 'head', origin: 'http://127.0.0.1:4511' },
        ],
        ['/', '/blog/font-family-math'],
      );

      expect(html).toContain('<img src="base/index.jpeg"');
      expect(html).toContain('<img src="head/index.jpeg"');
      expect(html).toContain('<img src="head/blog_font-family-math.jpeg"');
      expect(html).toContain('http://127.0.0.1:4511');
      expect(html.indexOf('base/index.jpeg')).toBeLessThan(
        html.indexOf('head/index.jpeg'),
      );
    });
  });

  describe('エッジケース', () => {
    it('パスとオリジンの文字を HTML としてそのまま書かない', () => {
      const html = renderScreenshotIndex(
        [{ side: 'base', origin: 'https://example.com/"><script>' }],
        ['/<b>&'],
      );

      expect(html).not.toContain('<script>');
      expect(html).not.toContain('<b>');
      expect(html).toContain('/&lt;b&gt;&amp;');
    });
  });
});
