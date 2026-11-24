import { describe, expect, it } from 'vitest';

import { searchReadings } from './search-readings';

const article = (
  title: string,
  publishedAt: string,
  sourceTitle = 'web.dev',
) => ({ title, publishedAt, sourceTitle });

const DAYS = [
  {
    picks: [
      {
        article: article(
          'Chrome 158 のリリースノート',
          '2026-11-20T01:00:00Z',
          'Chrome',
        ),
      },
    ],
    topics: [
      {
        articles: [
          article('CSS の scroll-state()', '2026-11-20T05:00:00Z'),
          article('Baseline 2026', '2026-11-20T03:00:00Z'),
        ],
      },
    ],
  },
  {
    picks: [],
    topics: [
      {
        articles: [
          article(
            'Chrome 157 のリリースノート',
            '2026-11-19T01:00:00Z',
            'Chrome',
          ),
        ],
      },
    ],
  },
];

const titlesOf = (items: ReadonlyArray<{ title: string }>): string[] =>
  items.map(({ title }) => title);

describe('searchReadings', () => {
  describe('正常系', () => {
    it('題が当たる記事を、見てほしい記事と話題をまたいで新しい順に並べる', () => {
      expect(titlesOf(searchReadings(DAYS, 'リリースノート'))).toStrictEqual([
        'Chrome 158 のリリースノート',
        'Chrome 157 のリリースノート',
      ]);
    });

    it('ソースの名前でも当たる', () => {
      expect(titlesOf(searchReadings(DAYS, 'web.dev'))).toStrictEqual([
        'CSS の scroll-state()',
        'Baseline 2026',
      ]);
    });

    it('空白で区切った語は、題とソースの名前のどちらかにすべて含まれる記事だけに当たる', () => {
      expect(titlesOf(searchReadings(DAYS, 'chrome 158'))).toStrictEqual([
        'Chrome 158 のリリースノート',
      ]);
    });
  });

  describe('エッジケース', () => {
    it('当たる記事が無ければ空にする', () => {
      expect(searchReadings(DAYS, 'Firefox')).toStrictEqual([]);
    });
  });
});
