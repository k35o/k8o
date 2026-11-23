import { describe, expect, it } from 'vitest';

import {
  articleKeyOf,
  digestDateOf,
  groupByDigestDate,
  normalizeDigest,
  toReadingDays,
} from './digest-days';

describe('digestDateOf', () => {
  describe('エッジケース', () => {
    it('日付は日本時間で区切る', () => {
      expect(digestDateOf('2026-11-19T14:59:59.000Z')).toBe('2026-11-19');
      expect(digestDateOf('2026-11-19T15:00:00.000Z')).toBe('2026-11-20');
    });
  });
});

describe('groupByDigestDate', () => {
  describe('正常系', () => {
    it('記事を日ごとに分け、新しい日から並べる', () => {
      const days = groupByDigestDate([
        { id: 3, publishedAt: '2026-11-19T16:00:00.000Z' },
        { id: 2, publishedAt: '2026-11-19T03:00:00.000Z' },
        { id: 1, publishedAt: '2026-11-18T03:00:00.000Z' },
      ]);

      expect(
        days.map(({ date, articles }) => [date, articles.map(({ id }) => id)]),
      ).toStrictEqual([
        ['2026-11-20', [3]],
        ['2026-11-19', [2]],
        ['2026-11-18', [1]],
      ]);
    });
  });
});

describe('articleKeyOf', () => {
  describe('正常系', () => {
    it('id の並びが違っても、同じ記事の集まりなら同じ値になる', () => {
      expect(articleKeyOf([12, 3, 7])).toBe(articleKeyOf([7, 12, 3]));
    });
  });
});

const draft = (
  overrides: Partial<Parameters<typeof normalizeDigest>[0]> = {},
): Parameters<typeof normalizeDigest>[0] => ({
  overview: 'CSS の話が中心の日。',
  picks: [],
  topics: [],
  ...overrides,
});

describe('normalizeDigest', () => {
  describe('正常系', () => {
    it('その日の記事を指す、見てほしい記事と話題をそのまま返す', () => {
      const digest = draft({
        picks: [{ articleId: 1, reason: '書き方が変わる。' }],
        topics: [
          { kind: 'explainer', headline: 'CSS の解説', articleIds: [2] },
          { kind: 'release', headline: 'Node.js 27 が出た', articleIds: [3] },
        ],
      });

      expect(normalizeDigest(digest, [1, 2, 3])).toStrictEqual(digest);
    });
  });

  describe('エッジケース', () => {
    it('見てほしい記事を、話題の側から外す', () => {
      expect(
        normalizeDigest(
          draft({
            picks: [{ articleId: 1, reason: '理由' }],
            topics: [
              { kind: 'release', headline: '話題A', articleIds: [1, 2] },
            ],
          }),
          [1, 2],
        )?.topics,
      ).toStrictEqual([
        { kind: 'release', headline: '話題A', articleIds: [2] },
      ]);
    });

    it('その日に無い id と、先の話題が取った id を捨てる', () => {
      expect(
        normalizeDigest(
          draft({
            picks: [{ articleId: 99, reason: '理由' }],
            topics: [
              { kind: 'release', headline: '話題A', articleIds: [1, 99] },
              { kind: 'report', headline: '話題B', articleIds: [1, 2] },
            ],
          }),
          [1, 2],
        ),
      ).toStrictEqual({
        overview: 'CSS の話が中心の日。',
        picks: [],
        topics: [
          { kind: 'release', headline: '話題A', articleIds: [1] },
          { kind: 'report', headline: '話題B', articleIds: [2] },
        ],
      });
    });

    it('どこにも入らなかった記事を、最後の話題にまとめる', () => {
      expect(
        normalizeDigest(
          draft({
            topics: [{ kind: 'release', headline: '話題A', articleIds: [1] }],
          }),
          [1, 2, 3],
        )?.topics,
      ).toStrictEqual([
        { kind: 'release', headline: '話題A', articleIds: [1] },
        { kind: 'other', headline: 'そのほかの記事', articleIds: [2, 3] },
      ]);
    });

    it('見てほしい記事は 3 件までにし、残りは話題に回す', () => {
      const digest = normalizeDigest(
        draft({
          picks: [1, 2, 3, 4].map((articleId) => ({
            articleId,
            reason: '理由',
          })),
        }),
        [1, 2, 3, 4],
      );

      expect(digest?.picks.map(({ articleId }) => articleId)).toStrictEqual([
        1, 2, 3,
      ]);
      expect(digest?.topics).toStrictEqual([
        { kind: 'other', headline: 'そのほかの記事', articleIds: [4] },
      ]);
    });

    it('文の中の改行と連続する空白を 1 つの空白にする', () => {
      expect(
        normalizeDigest(
          draft({
            overview: ' 全体\n 像 ',
            picks: [{ articleId: 1, reason: '理\n由' }],
          }),
          [1],
        ),
      ).toStrictEqual({
        overview: '全体 像',
        picks: [{ articleId: 1, reason: '理 由' }],
        topics: [],
      });
    });
  });

  describe('異常系', () => {
    it('理由が空か長すぎる記事は、見てほしい記事にしない', () => {
      expect(
        normalizeDigest(
          draft({
            picks: [
              { articleId: 1, reason: '' },
              { articleId: 2, reason: 'あ'.repeat(161) },
            ],
            topics: [{ kind: 'release', headline: '話題A', articleIds: [1] }],
          }),
          [1, 2],
        ),
      ).toStrictEqual({
        overview: 'CSS の話が中心の日。',
        picks: [],
        topics: [
          { kind: 'release', headline: '話題A', articleIds: [1] },
          { kind: 'other', headline: 'そのほかの記事', articleIds: [2] },
        ],
      });
    });

    it('全体像が空か長すぎれば null を返す', () => {
      const topics = [
        { kind: 'release' as const, headline: '話題A', articleIds: [1] },
      ];

      expect(normalizeDigest(draft({ overview: ' ', topics }), [1])).toBeNull();
      expect(
        normalizeDigest(draft({ overview: 'あ'.repeat(301), topics }), [1]),
      ).toBeNull();
    });

    it('指す記事が 1 つも残らなければ null を返す', () => {
      expect(
        normalizeDigest(
          draft({
            topics: [{ kind: 'release', headline: '話題A', articleIds: [99] }],
          }),
          [1],
        ),
      ).toBeNull();
    });
  });
});

const dayArticle = (id: number, publishedAt: string) => ({
  id,
  title: `記事${id}`,
  url: `https://example.com/${id}`,
  publishedAt,
  imageUrl: null,
  description: `説明${id}`,
  summary: null,
  source: { id: 1, title: 'Example', siteUrl: 'https://example.com' },
});

const DAY_ARTICLES = [
  dayArticle(4, '2026-11-19T16:00:00.000Z'),
  dayArticle(3, '2026-11-19T05:00:00.000Z'),
  dayArticle(2, '2026-11-19T03:00:00.000Z'),
  dayArticle(1, '2026-11-18T03:00:00.000Z'),
];

const storedDigest = (
  date: string,
  picks: Array<{ articleId: number; reason: string }>,
  topics: Array<{ kind: 'release'; headline: string; articleIds: number[] }>,
) => ({ date, overview: `${date} の全体像`, picks, topics });

const shapeOf = (days: ReturnType<typeof toReadingDays>) =>
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

describe('toReadingDays', () => {
  describe('正常系', () => {
    it('記事を日本時間の日ごとに分け、見てほしい記事と話題に振り分ける', () => {
      const days = toReadingDays(DAY_ARTICLES, [
        storedDigest(
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

    it('記事は、要約があれば要約を、無ければ説明を本文にし、ソースの名前を添える', () => {
      const [day] = toReadingDays(
        [
          { ...dayArticle(2, '2026-11-19T03:00:00.000Z'), summary: '要約2' },
          dayArticle(1, '2026-11-19T01:00:00.000Z'),
        ],
        [],
      );

      expect(day?.topics[0]?.articles).toStrictEqual([
        {
          id: 2,
          title: '記事2',
          url: 'https://example.com/2',
          publishedAt: '2026-11-19T03:00:00.000Z',
          imageUrl: null,
          text: '要約2',
          sourceTitle: 'Example',
        },
        {
          id: 1,
          title: '記事1',
          url: 'https://example.com/1',
          publishedAt: '2026-11-19T01:00:00.000Z',
          imageUrl: null,
          text: '説明1',
          sourceTitle: 'Example',
        },
      ]);
    });
  });

  describe('エッジケース', () => {
    it('まとめを作ったあとに増えた記事を、最後の話題にまとめる', () => {
      const days = toReadingDays(DAY_ARTICLES, [
        storedDigest('2026-11-19', [{ articleId: 2, reason: '理由' }], []),
      ]);

      expect(shapeOf(days)[1]?.topics).toStrictEqual([
        ['other', 'そのほかの記事', [3]],
      ]);
    });

    it('一覧に無い記事を指す、見てほしい記事と話題を出さない', () => {
      const days = toReadingDays(DAY_ARTICLES, [
        storedDigest(
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
