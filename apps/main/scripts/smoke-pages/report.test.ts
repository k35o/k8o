import { describe, expect, it } from 'vitest';

import { summarizeReportOnly } from './report';

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
