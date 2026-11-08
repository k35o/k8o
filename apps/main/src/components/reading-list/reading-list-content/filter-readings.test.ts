import { describe, expect, it } from 'vitest';

import { filterReadings } from './filter-readings';

const reading = (title: string, publishedAt: string, sourceId = 1) => ({
  title,
  publishedAt,
  source: { id: sourceId },
});

const ARTICLES = [
  reading('CSS の新しい機能', '2026-10-02T00:00:00.000Z', 1),
  reading('ＲＥＡＣＴ の Suspense', '2026-10-03T00:00:00.000Z', 2),
  reading('React と CSS', '2026-10-01T00:00:00.000Z', 1),
];

const titlesOf = (articles: ReadonlyArray<{ title: string }>): string[] =>
  articles.map((article) => article.title);

describe('filterReadings', () => {
  describe('正常系', () => {
    it('新しい順に並べる', () => {
      expect(
        titlesOf(
          filterReadings(ARTICLES, {
            query: '',
            sourceIds: [],
            sortOrder: 'newest',
          }),
        ),
      ).toStrictEqual([
        'ＲＥＡＣＴ の Suspense',
        'CSS の新しい機能',
        'React と CSS',
      ]);
    });

    it('古い順にも並べる', () => {
      expect(
        titlesOf(
          filterReadings(ARTICLES, {
            query: '',
            sourceIds: [],
            sortOrder: 'oldest',
          }),
        ).at(0),
      ).toBe('React と CSS');
    });

    it('空白で区切った語をすべて題に含む記事だけを残す', () => {
      expect(
        titlesOf(
          filterReadings(ARTICLES, {
            query: 'react css',
            sourceIds: [],
            sortOrder: 'newest',
          }),
        ),
      ).toStrictEqual(['React と CSS']);
    });

    it('全角と大文字の違いを吸収する', () => {
      expect(
        titlesOf(
          filterReadings(ARTICLES, {
            query: 'react',
            sourceIds: [],
            sortOrder: 'newest',
          }),
        ),
      ).toStrictEqual(['ＲＥＡＣＴ の Suspense', 'React と CSS']);
    });

    it('選んだソースの記事だけを残す', () => {
      expect(
        titlesOf(
          filterReadings(ARTICLES, {
            query: '',
            sourceIds: [2],
            sortOrder: 'newest',
          }),
        ),
      ).toStrictEqual(['ＲＥＡＣＴ の Suspense']);
    });
  });

  describe('エッジケース', () => {
    it('一致する記事が無ければ空の配列を返す', () => {
      expect(
        filterReadings(ARTICLES, {
          query: 'svelte',
          sourceIds: [],
          sortOrder: 'newest',
        }),
      ).toStrictEqual([]);
    });
  });
});
