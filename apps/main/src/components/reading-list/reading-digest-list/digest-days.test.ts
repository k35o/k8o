import { describe, expect, it } from 'vitest';

import { toDigestDays } from './digest-days';

const article = (id: number, publishedAt: string) => ({ id, publishedAt });

const ARTICLES = [
  article(4, '2026-11-19T16:00:00.000Z'),
  article(3, '2026-11-19T05:00:00.000Z'),
  article(2, '2026-11-19T03:00:00.000Z'),
  article(1, '2026-11-18T03:00:00.000Z'),
];

const digest = (
  date: string,
  picks: Array<{ articleId: number; reason: string }>,
  topics: Array<{ kind: 'release'; headline: string; articleIds: number[] }>,
) => ({ date, overview: `${date} の全体像`, picks, topics });

const shapeOf = (
  days: ReturnType<typeof toDigestDays<(typeof ARTICLES)[number], 'release'>>,
) =>
  days.map(({ date, overview, picks, topics }) => ({
    date,
    overview,
    picks: picks.map(({ article: { id }, reason }) => [id, reason]),
    topics: topics.map(({ kind, headline, articles }) => [
      kind,
      headline,
      articles.map(({ id }) => id),
    ]),
  }));

describe('toDigestDays', () => {
  describe('正常系', () => {
    it('記事を日本時間の日ごとに分け、見てほしい記事と話題に振り分ける', () => {
      const days = toDigestDays(ARTICLES, [
        digest(
          '2026-11-19',
          [{ articleId: 3, reason: '書き方が変わる。' }],
          [{ kind: 'release', headline: '話題A', articleIds: [2] }],
        ),
      ]);

      expect(shapeOf(days)).toStrictEqual([
        {
          date: '2026-11-20',
          overview: null,
          picks: [],
          topics: [['other', 'この日の記事', [4]]],
        },
        {
          date: '2026-11-19',
          overview: '2026-11-19 の全体像',
          picks: [[3, '書き方が変わる。']],
          topics: [['release', '話題A', [2]]],
        },
        {
          date: '2026-11-18',
          overview: null,
          picks: [],
          topics: [['other', 'この日の記事', [1]]],
        },
      ]);
      expect(days.map(({ articleCount }) => articleCount)).toStrictEqual([
        1, 2, 1,
      ]);
    });
  });

  describe('エッジケース', () => {
    it('まとめを作ったあとに増えた記事を、最後の話題にまとめる', () => {
      const days = toDigestDays(ARTICLES, [
        digest('2026-11-19', [{ articleId: 2, reason: '理由' }], []),
      ]);

      expect(shapeOf(days)[1]?.topics).toStrictEqual([
        ['other', 'そのほかの記事', [3]],
      ]);
    });

    it('一覧に無い記事を指す、見てほしい記事と話題を出さない', () => {
      const days = toDigestDays(ARTICLES, [
        digest(
          '2026-11-18',
          [{ articleId: 99, reason: '理由' }],
          [
            { kind: 'release', headline: '消えた記事の話題', articleIds: [99] },
            { kind: 'release', headline: '話題A', articleIds: [1, 99] },
          ],
        ),
      ]);

      expect(shapeOf(days)[2]).toStrictEqual({
        date: '2026-11-18',
        overview: '2026-11-18 の全体像',
        picks: [],
        topics: [['release', '話題A', [1]]],
      });
    });
  });
});
