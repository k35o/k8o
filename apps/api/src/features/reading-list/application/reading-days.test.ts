import { describe, expect, it } from 'vitest';

import type { ReadingArticle } from '../infrastructure/reading-list-repository';
import { toReadingDays } from './reading-days';

const article = (id: number, publishedAt: string): ReadingArticle => ({
  id,
  title: `記事${id}`,
  url: `https://example.com/${id}`,
  publishedAt,
  imageUrl: null,
  text: `要約${id}`,
  summary: `要約${id}`,
  description: `説明${id}`,
  sourceTitle: 'Example',
});

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

const shapeOf = (days: ReturnType<typeof toReadingDays>) =>
  days.map(
    ({ date, articleCount, overview, picks, topics, remainingArticles }) => ({
      date,
      articleCount,
      overview,
      picks: picks.map(({ article: { id }, reason }) => [id, reason]),
      topics: topics.map(({ kind, headline, articles }) => [
        kind,
        headline,
        articles.map(({ id }) => id),
      ]),
      remainingArticles: remainingArticles.map(({ id }) => id),
    }),
  );

describe('toReadingDays', () => {
  describe('正常系', () => {
    it('記事を日本時間の日ごとに分け、その日のまとめの見てほしい記事と話題に入れる', () => {
      const days = toReadingDays(ARTICLES, [
        digest(
          '2026-11-19',
          [{ articleId: 3, reason: '書き方が変わる。' }],
          [{ kind: 'release', headline: '話題A', articleIds: [2] }],
        ),
      ]);

      expect(shapeOf(days)).toStrictEqual([
        {
          date: '2026-11-20',
          articleCount: 1,
          overview: null,
          picks: [],
          topics: [],
          remainingArticles: [4],
        },
        {
          date: '2026-11-19',
          articleCount: 2,
          overview: '2026-11-19 の全体像',
          picks: [[3, '書き方が変わる。']],
          topics: [['release', '話題A', [2]]],
          remainingArticles: [],
        },
        {
          date: '2026-11-18',
          articleCount: 1,
          overview: null,
          picks: [],
          topics: [],
          remainingArticles: [1],
        },
      ]);
    });
  });

  describe('エッジケース', () => {
    it('まとめのどこにも入らなかった記事は、話題にせず残りの記事として返す', () => {
      const days = toReadingDays(ARTICLES, [
        digest('2026-11-19', [{ articleId: 2, reason: '理由' }], []),
      ]);

      expect(shapeOf(days)[1]).toMatchObject({
        topics: [],
        remainingArticles: [3],
      });
    });

    it('一覧に無い記事を指す、見てほしい記事と話題を出さない', () => {
      const days = toReadingDays(ARTICLES, [
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
        articleCount: 1,
        overview: '2026-11-18 の全体像',
        picks: [],
        topics: [['release', '話題A', [1]]],
        remainingArticles: [],
      });
    });

    it('記事の無い日のまとめは出さない', () => {
      const days = toReadingDays(ARTICLES, [
        digest(
          '2026-11-17',
          [],
          [{ kind: 'release', headline: '話題A', articleIds: [1] }],
        ),
      ]);

      expect(days.map(({ date }) => date)).toStrictEqual([
        '2026-11-20',
        '2026-11-19',
        '2026-11-18',
      ]);
    });
  });
});
