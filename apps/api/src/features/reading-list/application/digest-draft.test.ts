import { describe, expect, it } from 'vitest';

import { articleKeyOf, normalizeDigest } from './digest-draft';
import type { DigestDraft } from './digest-draft';

describe('articleKeyOf', () => {
  describe('正常系', () => {
    it('id の並びが違っても、同じ記事の集まりなら同じ値になる', () => {
      expect(articleKeyOf([12, 3, 7])).toBe(articleKeyOf([7, 12, 3]));
    });
  });
});

const draft = (overrides: Partial<DigestDraft> = {}): DigestDraft => ({
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

    it('どこにも入らなかった記事は、まとめに入れない', () => {
      expect(
        normalizeDigest(
          draft({
            topics: [{ kind: 'release', headline: '話題A', articleIds: [1] }],
          }),
          [1, 2, 3],
        )?.topics,
      ).toStrictEqual([
        { kind: 'release', headline: '話題A', articleIds: [1] },
      ]);
    });

    it('見てほしい記事は 3 件までにする', () => {
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
        topics: [{ kind: 'release', headline: '話題A', articleIds: [1] }],
      });
    });

    it('見出しが空か長すぎる話題は捨てる', () => {
      expect(
        normalizeDigest(
          draft({
            topics: [
              { kind: 'release', headline: ' ', articleIds: [1] },
              { kind: 'report', headline: 'あ'.repeat(121), articleIds: [2] },
              { kind: 'opinion', headline: '話題C', articleIds: [3] },
            ],
          }),
          [1, 2, 3],
        )?.topics,
      ).toStrictEqual([
        { kind: 'opinion', headline: '話題C', articleIds: [3] },
      ]);
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
