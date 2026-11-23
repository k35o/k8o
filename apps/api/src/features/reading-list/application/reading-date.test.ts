import { describe, expect, it } from 'vitest';

import { groupByReadingDate, readingDateOf } from './reading-date';

describe('readingDateOf', () => {
  describe('エッジケース', () => {
    it('日付は日本時間で区切る', () => {
      expect(readingDateOf('2026-11-19T14:59:59.000Z')).toBe('2026-11-19');
      expect(readingDateOf('2026-11-19T15:00:00.000Z')).toBe('2026-11-20');
    });
  });
});

describe('groupByReadingDate', () => {
  describe('正常系', () => {
    it('記事を日ごとに分け、新しい日から並べる', () => {
      const days = groupByReadingDate([
        { id: 3, publishedAt: '2026-11-19T16:00:00.000Z' },
        { id: 1, publishedAt: '2026-11-18T03:00:00.000Z' },
        { id: 2, publishedAt: '2026-11-19T03:00:00.000Z' },
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
